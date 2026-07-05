import express from 'express';
import {
  submitContact,
  getContacts,
  updateContactStatus,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contactValidation } from '../validators/authValidator.js';

const router = express.Router();

router.post('/', contactValidation, validate, submitContact);
router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id', protect, authorize('admin'), updateContactStatus);

export default router;
