import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as tenants from '../controllers/tenantController';
import * as analytics from '../controllers/analyticsController';
import * as recovery from '../controllers/recoveryController';
import * as config from '../controllers/configController';
import * as workflow from '../controllers/workflowController';
import * as landlord from '../controllers/landlordController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.post('/auth/verify-email', auth.verifyEmail);
router.post('/auth/request-password-reset', auth.requestPasswordReset);
router.post('/auth/reset-password', auth.resetPassword);

router.get('/analytics/summary', authRequired, analytics.getSummary);

router.post('/tenants', authRequired, tenants.createTenant);
router.get('/tenants', authRequired, tenants.listTenants);
router.get('/tenants/:id/payments', authRequired, tenants.listTenantPayments);

router.post('/recovery/run-daily', authRequired, recovery.runDailyRecovery);

router.get('/config/late-fee', authRequired, config.getLateFee);
router.put('/config/late-fee', authRequired, config.setLateFee);

router.get('/workflows/active', authRequired, workflow.getActiveWorkflow);
router.post('/workflows', authRequired, workflow.createWorkflow);
router.get('/workflows/:id', authRequired, workflow.getWorkflowById);

router.get('/landlord/profile', authRequired, landlord.getProfile);
router.put('/landlord/profile', authRequired, landlord.updateProfile);

export default router;
