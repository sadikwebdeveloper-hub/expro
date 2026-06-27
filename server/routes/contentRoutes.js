import { Router } from 'express';
import {
  contentController,
  PUBLIC_GET_KEYS,
  ADMIN_GET_KEYS,
} from '../controllers/contentController.js';
import { upload } from '../config/upload.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { messageValidation } from '../middleware/validators.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

PUBLIC_GET_KEYS.forEach((key) => {
  router.get(`/${key}`, (req, res) => {
    req.params.key = key;
    return contentController.getPublicCollection(req, res);
  });
});

ADMIN_GET_KEYS.forEach((key) => {
  router.get(`/${key}`, authenticate, requireAdmin, (req, res) => {
    req.params.key = key;
    return contentController.getAdminCollection(req, res);
  });
});

router.put('/config', authenticate, requireAdmin, contentController.updateConfig);
router.put('/slides', authenticate, requireAdmin, contentController.updateSlides);
router.put('/about', authenticate, requireAdmin, contentController.updateAbout);
router.put('/services', authenticate, requireAdmin, contentController.updateServices);

router.put('/partners/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'partners';
  return contentController.updateListItem(req, res);
});
router.put('/achievements/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'achievements';
  return contentController.updateListItem(req, res);
});
router.put('/directors/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'directors';
  return contentController.updateListItem(req, res);
});

router.post('/companies', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.createWithUpload(req, res, 'companies')
);
router.put('/companies/:id', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.updateWithUpload(req, res, 'companies')
);
router.delete('/companies/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'companies';
  return contentController.deleteItem(req, res);
});

router.post('/products', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.createWithUpload(req, res, 'products')
);
router.put('/products/:id', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.updateWithUpload(req, res, 'products')
);
router.delete('/products/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'products';
  return contentController.deleteItem(req, res);
});

router.post('/news', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.createWithUpload(req, res, 'news')
);
router.put('/news/:id', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.updateWithUpload(req, res, 'news')
);
router.delete('/news/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'news';
  return contentController.deleteItem(req, res);
});

router.post('/media', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.createWithUpload(req, res, 'media')
);
router.put('/media/:id', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.updateWithUpload(req, res, 'media')
);
router.delete('/media/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'media';
  return contentController.deleteItem(req, res);
});

router.post('/achievements', authenticate, requireAdmin, (req, res) =>
  contentController.simpleCreate(req, res, 'achievements')
);
router.delete('/achievements/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'achievements';
  return contentController.deleteItem(req, res);
});

router.post('/partners', authenticate, requireAdmin, (req, res) =>
  contentController.simpleCreate(req, res, 'partners')
);
router.delete('/partners/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'partners';
  return contentController.deleteItem(req, res);
});

router.post('/directors', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.createWithUpload(req, res, 'directors')
);
router.put('/directors/:id', authenticate, requireAdmin, upload.single('image'), (req, res) =>
  contentController.updateWithUpload(req, res, 'directors')
);
router.delete('/directors/:id', authenticate, requireAdmin, (req, res) => {
  req.params.key = 'directors';
  return contentController.deleteItem(req, res);
});

router.post('/users', authenticate, requireSuperAdmin, (req, res) =>
  contentController.simpleCreate(req, res, 'users')
);
router.delete('/users/:id', authenticate, requireSuperAdmin, (req, res) => {
  req.params.key = 'users';
  return contentController.deleteItem(req, res);
});

router.post('/messages', contactLimiter, messageValidation, validate, contentController.createMessage);
router.post('/visit', contentController.trackVisit);

export default router;
