const express = require('express');
const router = express.Router();
const pool = require('../db');

const verifyAgent = require('./verifyAgent');
const fs = require('fs');
const path = require('path');

router.post('/book', verifyAgent, async (req, res) => {
  const form = req.body;
  const parcels = req.body.parcels || [];

  if (!form.fromStation || !form.toStation) {
    return res.status(400).json({ message: 'fromStation and toStation are required' });
  }

  try {
    // Get branch code
    const [branchRows] = await pool.query('SELECT code FROM branches WHERE name = ?', [form.fromStation]);
    if (branchRows.length === 0) {
      return res.status(400).json({ message: 'Invalid fromStation (branch name)' });
    }
    const branchCode = branchRows[0].code;

    // Get LR No
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM bookings WHERE fromStation = ?',
      [form.fromStation]
    );
    const todayCount = countRows[0].count + 1;
    const paddedCount = String(todayCount).padStart(1, '0');
    const lrNo = `${branchCode}/${paddedCount}`;

    // Insert booking
    const [bookingResult] = await pool.query(
      `INSERT INTO bookings (
        lrNo, fromStation, toStation, senderName, senderPhone, senderGST, senderAddress,
        receiverName, receiverPhone, receiverGST, receiverAddress, totalWeight, type, status,goodvalue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        lrNo,
        form.fromStation,
        form.toStation,
        form.senderName,
        form.senderPhone,
        form.senderGST,
        form.senderAddress,
        form.receiverName,
        form.receiverPhone,
        form.receiverGST,
        form.receiverAddress,
        form.totalWeight,
        form.type,
        'Booked',
        form.Goodvalue,
      ]
    );

    const bookingId = bookingResult.insertId;

    // Insert parcels
    const parcelInserts = parcels.map(p => [
      bookingId,
      p.articleType,
      p.noOfParcels,
      p.parcelType,
      p.content,
      p.amtPerBox,
      p.total,
    ]);

    await pool.query(
      `INSERT INTO parcels (bookingId, articleType, noOfParcels, parcelType, content, amtPerBox, total) VALUES ?`,
      [parcelInserts]
    );
    let deliveryAddress = '';
    let deliveryMobile = '';
    
    const [toBranchRows] = await pool.query(
      'SELECT address, mobile FROM branches WHERE name = ?',
      [form.toStation]
    );
    
    if (toBranchRows.length > 0) {
      deliveryAddress = toBranchRows[0].address;
      deliveryMobile = toBranchRows[0].mobile;
    } else {
      const [senderbranch] = await pool.query(
        'SELECT address, mobile FROM branches WHERE name = ?',
        [form.fromStation]
      );
    
      if (senderbranch.length > 0) {
        deliveryAddress = senderbranch[0].address;
        deliveryMobile = senderbranch[0].mobile;
      } else {
        deliveryAddress = 'N/A';
        deliveryMobile = 'N/A';
      }
    }
    

    // === HTML to PDF Generation ===
    const templatePath = path.join(__dirname, '../templates/billtemplate2.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);

    const totalAmount = form.totalAmt || parcels.reduce((sum, p) => sum + Number(p.total), 0);

    const html = template({
      lrNo,
      fromStation: form.fromStation,
      toStation: form.toStation,
      date: new Date().toLocaleDateString(),
      senderName: form.senderName,
      senderPhone: form.senderPhone,
      senderGST: form.senderGST,
      senderAddress: form.senderAddress,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      receiverGST: form.receiverGST,
      receiverAddress: form.receiverAddress,
      totalWeight: form.totalWeight,
      type: form.type,
      status: 'Booked',
      parcels,
      totalAmount,
      deliveryAddress,
      deliveryMobile,
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="booking-${lrNo}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Booking save error:', err);
    res.status(500).json({ message: 'Error saving booking' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { from, to, filter } = req.query;
    let whereClause = '';
    const params = [];

    if (filter === 'today') {
      whereClause = `WHERE b.createdAt BETWEEN CURDATE() AND CURDATE() + INTERVAL 1 DAY - INTERVAL 1 SECOND`;
    } else if (from && to) {
      whereClause = `WHERE b.createdAt BETWEEN ? AND ?`;
      // Append end of the 'to' day to include full day
      params.push(from, `${to} 23:59:59`);
    }

    const [bookings] = await pool.query(
      `SELECT b.id, b.lrNo, b.status, b.fromStation, b.toStation, b.senderName, b.receiverName, b.createdAt
       FROM bookings b
       ${whereClause}
       ORDER BY b.createdAt DESC`,
      params
    );

    const [parcels] = await pool.query(`SELECT * FROM parcels`);
    
      const [dispatch] = await pool.query(`SELECT * FROM dispatch_logs`);
     const [logs] = await pool.query(`SELECT * FROM booking_status_logs`);
    


    const result = bookings.map(b => ({
      ...b,
      parcels: parcels.filter(p => p.bookingId === b.id),
      dispatch: dispatch.filter(d => {
        let ids;
        try {
          ids = JSON.parse(d.bookingId);
          if (!Array.isArray(ids)) {
            ids = [d.bookingId];
          }
        } catch {
          ids = [d.bookingId];
        }
        return ids.map(id => String(id)).includes(String(b.id));
      }),
      
      logs: logs.filter(l => l.bookingId === b.id)
          }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});
router.get('/all', async (req, res) => {
  try {
    const [bookings] = await pool.query(
     ` SELECT 
        b.id, b.lrNo, b.status, b.fromStation, b.toStation, b.senderName, b.receiverName, b.createdAt 
      FROM bookings b 
      ORDER BY b.createdAt DESC`
    );

    // Fetch parcels for each booking
    const [parcels] = await pool.query('SELECT * FROM parcels');

    const result = bookings.map(b => ({
      ...b,
      parcels: parcels.filter(p => p.bookingId === b.id)
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}); 
router.put('/status/:id',verifyAgent, async (req, res) => {
  const { id } = req.params;
  const { status, changedBy } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  if (status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const connection = await pool.getConnection();
  try {
    // Get current status
    const [rows] = await connection.query('SELECT status FROM bookings WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const oldStatus = rows[0].status;

    // Update status
    const [result] = await connection.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Insert log entry
    await connection.query(
      'INSERT INTO booking_status_logs (bookingId, oldStatus, newStatus, changedBy) VALUES (?, ?, ?, ?)',
      [id, oldStatus, status, changedBy || null]
    );

    res.json({ message: 'Status updated, log created' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Failed to update status' });
  } finally {
    connection.release();
  }
});

// backend/routes/bookings.js
router.put('/status', async (req, res) => {
  const { bookingIds, status, busNo = null, dispatchedBy = null } = req.body;

  if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
    return res.status(400).json({ message: 'No booking IDs provided' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const id of bookingIds) {
      await connection.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    }

    let dispatchLogId = null;

    if (status === 'Dispatched') {
      const [result] = await connection.query(
        'INSERT INTO dispatch_logs (bookingId, busNo, dispatchedBy) VALUES (?, ?, ?)',
        [JSON.stringify(bookingIds), busNo, dispatchedBy]
      );
     
      dispatchLogId = result.insertId;
    }

    await connection.commit();
    res.json({
      message: 'Bookings dispatched successfully',
      dispatchLogId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error during dispatch:', err);
    res.status(500).json({ message: 'Failed to dispatch' });
  } finally {
    connection.release();
  }
});
// in routes/bookings.js
router.get('/lr/:lrNo', async (req, res) => {
  const { lrNo } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE lrNo = ?',
      [lrNo]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

    const booking = rows[0];

    const [parcels] = await pool.query(
      'SELECT * FROM parcels WHERE bookingId = ?',
      [booking.id]
    );
    const [dispatch_logs] = await pool.query(
      'SELECT * FROM dispatch_logs WHERE bookingId = ?',
      [booking.id]
    );
    res.json({ ...booking, parcels,dispatch_logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/dispatch-bill/:logId/pdf', async (req, res) => {
  const { logId } = req.params;

  const connection = await pool.getConnection();
  try {
    // Get dispatch log
    const [rows] = await connection.query('SELECT * FROM dispatch_logs WHERE id = ?', [logId]);
    if (!rows.length) return res.status(404).send('Dispatch log not found');

    const dispatch = rows[0];
    const bookingIds = JSON.parse(dispatch.bookingId); // array of booking IDs

    // Get booking details
    const [bookingDetails] = await connection.query(
      `SELECT id, lrNo, toStation FROM bookings WHERE id IN (?)`,
      [bookingIds]
    );

    // Get parcels associated with bookings
    const [parcelDetails] = await connection.query(
      `SELECT bookingId, noOfParcels, total FROM parcels WHERE bookingId IN (?)`,
      [bookingIds]
    );

    // Group parcels by bookingId
    const parcelsByBooking = {};
    parcelDetails.forEach(parcel => {
      if (!parcelsByBooking[parcel.bookingId]) {
        parcelsByBooking[parcel.bookingId] = [];
      }
      parcelsByBooking[parcel.bookingId].push({
        noOfParcels: parcel.noOfParcels,
        total: parcel.total
      });
    });

    // Enrich booking details with parcels
    const enrichedBookings = bookingDetails.map(booking => ({
      ...booking,
      parcels: parcelsByBooking[booking.id] || []
    }));

    // Total amount (sum of all parcels.total)
    const total = parcelDetails.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    const totalNum = Number(total);
    
    const formattedTotal =
      typeof totalNum === 'number' && !isNaN(totalNum)
        ? totalNum.toFixed(2)
        : '0.00';
        handlebars.registerHelper('inc', (value) => {
          return parseInt(value, 10) + 1;
        });
    
    
    // Compile HTML
    const html = fs.readFileSync(path.join(__dirname, '../templates/dispatch-bill.html'), 'utf8');
    const template = handlebars.compile(html);
   
    const htmlToRender = template({
      busNo: dispatch.busNo,
      dispatchedBy: dispatch.dispatchedBy,
      date: new Date(dispatch.dispatchedAt || dispatch.timestamp).toLocaleDateString(),
      bookingIds: enrichedBookings,
      totalAmount:  formattedTotal,
    });
    


    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlToRender);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=dispatch-bill-${logId}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Dispatch bill PDF error:', err);
    res.status(500).send('Failed to generate dispatch bill');
  } finally {
    connection.release();
  }
});






// GET /lr/:lrNo/pdf - Generate LR PDF without re-booking

const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

router.get('/lr/:lrNo/pdf', async (req, res) => {
  const { lrNo } = req.params;

  const [bookings] = await pool.query('SELECT * FROM bookings WHERE lrNo = ?', [lrNo]);
  if (!bookings.length) return res.status(404).json({ message: 'Not found' });
  const booking = bookings[0];
  const [parcels] = await pool.query('SELECT * FROM parcels WHERE bookingId = ?', [booking.id]);
  let deliveryAddress = '';
  let deliveryMobile = '';
  
  const [toBranchRows] = await pool.query(
    'SELECT address, mobile FROM branches WHERE name = ?',
    [booking.toStation]
  );
  
  if (toBranchRows.length > 0) {
    deliveryAddress = toBranchRows[0].address;
    deliveryMobile = toBranchRows[0].mobile;
  } else {
    const [senderbranch] = await pool.query(
      'SELECT address, mobile FROM branches WHERE name = ?',
      [booking.fromStation]
    );
  
    if (senderbranch.length > 0) {
      deliveryAddress = senderbranch[0].address;
      deliveryMobile = senderbranch[0].mobile;
    } else {
      deliveryAddress = 'N/A';
      deliveryMobile = 'N/A';
    }
  }
  
  const totalAmount = parcels.reduce((sum, p) => sum + Number(p.total), 0);

  // Read and compile the template
  const html = fs.readFileSync(path.join(__dirname, '../templates/billtemplate2.html'), 'utf8');
  const template = handlebars.compile(html);
  const htmlToRender = template({
    lrNo: booking.lrNo,
    date: new Date(booking.createdAt).toLocaleDateString(),
    fromStation: booking.fromStation,
    toStation: booking.toStation,
    vehicleNo: booking.vehicleNo,
    driverPhone: booking.driverPhone,
    senderName: booking.senderName,
    senderPhone: booking.senderPhone,
    senderAddress: booking.senderAddress,
    senderGST: booking.senderGST,
    receiverName: booking.receiverName,
    receiverPhone: booking.receiverPhone,
    receiverAddress: booking.receiverAddress,
    receiverGST: booking.receiverGST,
    type:booking.type,
    deliveryAddress,
    deliveryMobile,
    parcels,
    totalAmount,
    advance: booking.advance || 0,
  });

  // Generate PDF using puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlToRender);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=lr-${lrNo}.pdf`,
  });
  res.send(pdfBuffer);
});




module.exports = router;
