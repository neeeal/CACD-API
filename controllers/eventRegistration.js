const EventRegistrationsCol = require("../models/eventRegistrations.js");
const EventsCol = require("../models/events.js");
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

const fs = require('fs').promises;
const path = require('path');
const transporter = require("../config/mailer.js");

// TODO: add unique eventRegistrationID
exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "get all active event registrations",
    data: data || [],
    count: data && data.length
  })
};

exports.getOne = async (req, res) => {
  const params = req.params;
  const user = req.user;

  let data;
  try{
    const query = { deletedAt: null, _id: params.eventRegistration, company: user.company };

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "EventRegistrations get",
    data: data || [],
    count: data && data.length 
  })
}

exports.getByCompany = async (req, res) => {
  const queryParams = req.query || {};
  const user = req.user;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, company: user.company },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User get",
    data: data,
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  let newEventRegistration = req.body;
  const uploadedPhotos = req.files;

  if (uploadedPhotos && uploadedPhotos.length) {
    try {
      const savedPhotos = await utils.saveMultiplePhotos({ uploadedPhotos, details: newEventRegistration });
      newEventRegistration.photos = savedPhotos;
    } catch (err) {
      return res.status(500).send({ error: "Server error" });
    }
  }

  let newEventRegistrationDoc, eventDetails;
  try {
    newEventRegistrationDoc = new EventRegistrationsCol(newEventRegistration);
    const savedDoc = await newEventRegistrationDoc.save();
    eventDetails = await EventsCol.findOneAndUpdate({ _id: newEventRegistration.event }, { $inc: { slots: -1 }}); // just a side call for now
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).send({ error: "Duplicate key error." });
    }
    return res.status(500).send({ error: "Server error" });
  }

  // Send confirmation email
  try {
    // Read the HTML template
    let htmlContent = await fs.readFile(
      path.join(__dirname, '../html/eventRegistrationConfirmation.html'), 
      'utf8'
    );

    // Replace placeholders in the template
    htmlContent = htmlContent
      .replace('{{name}}', newEventRegistration.registrantInfo.name || 'Valued Participant')
      .replace(/{{email}}/g, process.env.MAIL_EMAIL)
      .replace('{{event_name}}', eventDetails.name || 'the event');

    // Configure email options
    console.log(newEventRegistration)
    const mailOptions = {
      from: process.env.MAIL_EMAIL,
      to: newEventRegistration.registrantInfo.email,
      subject: 'Event Registration Received',
      html: htmlContent
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    // We're not returning an error to the client here since the registration was successful
    // But we log it for debugging purposes
  }


  // Send notification email to support team
  try {
    // Read the HTML template for support notification
    let supportHtmlContent = await fs.readFile(
      path.join(__dirname, '../html/supportNotification.html'), 
      'utf8'
    );
    
    // Generate HTML table for registration details
    const registrationDetails = generateRegistrationDetailsHTML(newEventRegistration);
    
    // Generate HTML table for event details
    const eventDetailsHTML = generateEventDetailsHTML(eventDetails);
    
    // Generate HTML for photos
    const photosHTML = await generatePhotosHTML(newEventRegistration.photos);
    
    // Replace placeholders in the template
    supportHtmlContent = supportHtmlContent
      .replace('{{event_name}}', eventDetails.name || 'Unnamed Event')
      .replace('{{registrant_name}}', newEventRegistration.registrantInfo.name || 'Unnamed Registrant')
      .replace('{{registrant_email}}', newEventRegistration.registrantInfo.email || 'No email provided')
      .replace('{{registration_date}}', new Date().toLocaleString())
      .replace('{{registration_details}}', registrationDetails)
      .replace('{{event_details}}', eventDetailsHTML)
      .replace('{{photos}}', photosHTML);
    
    // Send notification email to support using nodemailer with Amazon SES
    const mailOptions = {
      from: process.env.MAIL_EMAIL,
      to: process.env.MAIL_EMAIL,
      subject: `New Event Registration - ${eventDetails.name || 'Unnamed Event'}`,
      html: supportHtmlContent
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    console.log('Support notification email sent successfully');
  } catch (err) {
    console.error('Error sending support notification email:', err);
    // We're not returning an error to the client here since the registration was successful
    // But we log it for debugging purposes
  }

  res.status(200).send({
    message: "post",
    data: newEventRegistrationDoc
  });
};


// Helper function to generate HTML table for registration details
function generateRegistrationDetailsHTML(registration) {
  if (!registration || !registration.registrantInfo) {
    return '<p>No registration details available</p>';
  }
  
  let html = '<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">';
  
  // Add table header
  html += '<tr style="background-color: #f2f2f2;"><th colspan="2">Registration Information</th></tr>';
  
  // Process registrantInfo data
  for (const [key, value] of Object.entries(registration.registrantInfo)) {
    if (value && key !== 'photos' && key !== 'company') {
      html += `<tr><td><strong>${formatFieldName(key)}</strong></td><td>${value}</td></tr>`;
    }
  }
  
  // Add any additional registration details not in registrantInfo
  for (const [key, value] of Object.entries(registration)) {
    if (
      value &&
      typeof value !== 'object' &&
      key !== 'event' &&
      key !== 'photos' &&
      key !== 'registrantInfo' &&
      key !== '_id' &&
      key !== 'company'
    ) {
      html += `<tr><td><strong>${formatFieldName(key)}</strong></td><td>${value}</td></tr>`;
    }
  }

  html += '</table>';
  return html;
}


// Helper function to generate HTML table for event details
function generateEventDetailsHTML(event) {
  if (!event) {
    return '<p>No event details available</p>';
  }
  
  let html = '<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">';
  
  // Add table header
  html += '<tr style="background-color: #f2f2f2;"><th colspan="2">Event Information</th></tr>';
  
  // Process event data
  const fieldsToShow = ['name', 'date', 'time', 'venue', 'description', 'price', 'slots'];
  
  for (const field of fieldsToShow) {
    if (event[field] !== undefined) {
      let displayValue = event[field];
      // Format date if it's a date field
      if (field === 'date' && event[field] instanceof Date) {
        displayValue = event[field].toLocaleDateString();
      }
      html += `<tr><td><strong>${formatFieldName(field)}</strong></td><td>${displayValue}</td></tr>`;
    }
  }
  
  html += '</table>';
  return html;
}

async function generatePhotosHTML(photos) {
  if (!photos || !photos.length) {
    return '<p>No photos attached</p>';
  }

  const photoLinks = [];

  for (const photoId of photos) {
    try {
      const photoDoc = await PhotosCol.findOne({ _id: photoId }).lean();
      if (photoDoc?.metadata?.location) {
        photoLinks.push(photoDoc.metadata.location);
      }
    } catch (err) {
      console.log(`Failed to retrieve photo with ID ${photoId}:`, err);
    }
  }

  if (!photoLinks.length) {
    return '<p>No valid photo URLs found</p>';
  }

  let html = '<h3>Attached Photos </h3><ul>';
  photoLinks.forEach((url, index) => {
    html += `<li><a href="${url}" target="_blank">${url}</a></li>`;
  });
  html += '</ul>';

  return html;
}


// Helper function to format field names (convert camelCase to Title Case with spaces)
function formatFieldName(name) {
  return name
    .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
    .trim(); // Remove any leading/trailing spaces
}
// TODO: add unique eventRegistrationID
exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "get all active event registrations",
    data: data || [],
    count: data && data.length
  })
};



exports.put = async (req, res) => {
  let newEventRegistration = req.body;

  const query = {
    _id: newEventRegistration.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      ...newEventRegistration,
    }
  };

  const options = { new: true };

  try {
    newEventRegistration = await utils.updateAndPopulate({ query: query, values: values, options: options, col: EventRegistrationsCol });

    if (!newEventRegistration) 
      throw new Error("Event registration not found");

  } catch (err) {
    console.error(err.stack);

    // Handle "Event registration not found" error
    if (err.message.includes("not found")) {
      return res.status(404).send({ error: err.message });
    }

    // Handle invalid Object ID error
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)) {
      return res.status(400).send({ error: "Invalid Object ID" });
    }

    // Handle duplicate key error (MongoServerError with code 11000)
    if (err.code === 11000) {
      return res.status(400).send({
        error: `Duplicate key error. A Event registration with this ${Object.keys(err.keyValue).join(', ')} already exists.`,
      });
    }

    // General server error
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "put",
    data: newEventRegistration
  });
};

exports.status = async (req, res) => {
  let newEventRegistration = req.body;

  const query = {
    _id: newEventRegistration.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      status:newEventRegistration.status
    }
  };

  const options = { new: true };

  try {
    newEventRegistration = await utils.updateAndPopulate({ query: query, values: values, options: options, col: EventRegistrationsCol });

    if (!newEventRegistration) 
      throw new Error("Event registration not found");

  } catch (err) {
    console.error(err.stack);

    // Handle "Event registration not found" error
    if (err.message.includes("not found")) {
      return res.status(404).send({ error: err.message });
    }

    // Handle invalid Object ID error
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)) {
      return res.status(400).send({ error: "Invalid Object ID" });
    }

    // Handle duplicate key error (MongoServerError with code 11000)
    if (err.code === 11000) {
      return res.status(400).send({
        error: `Duplicate key error. A Event registration with this ${Object.keys(err.keyValue).join(', ')} already exists.`,
      });
    }

    // General server error
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "put",
    data: newEventRegistration
  });
};

exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let newEventRegistration;
  try {
    newEventRegistration = await EventRegistrationsCol.findOneAndUpdate(
      { 
        _id: OID, 
        deletedAt: null
      },
      {
        $set: {
          deletedAt: moment().toISOString()
        }
    }
  );
  } catch (err){
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });
    
    return res.status(500).send({ error: "Server error" });
  }

  if (!newEventRegistration) {
    return res.status(404).send({ error: "Event registration not found" });
  }

  res.status(200).send({
    message: "get",
    data: newEventRegistration
  })
};