import Contact from '../models/Contact.js';
import { asyncHandler } from '../utils/apiResponse.js';
import { sendContactNotification } from '../services/emailService.js';

export const submitContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create(req.body);

  await sendContactNotification(contact);

  res.status(201).json({
    success: true,
    message: 'Thank you for contacting us. We will get back to you soon.',
    contact: {
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
    },
  });
});

export const getContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;

  const [contacts, total] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Contact.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    contacts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.status(200).json({ success: true, contact });
});
