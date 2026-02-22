import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as tenants from '../controllers/tenantController';
import * as analytics from '../controllers/analyticsController';
import * as recovery from '../controllers/recoveryController';
import * as config from '../controllers/configController';
import * as workflow from '../controllers/workflowController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

router.get('/analytics/summary', authRequired, analytics.getSummary);

router.post('/tenants', authRequired, tenants.createTenant);
router.get('/tenants', authRequired, tenants.listTenants);

router.post('/recovery/run-daily', authRequired, recovery.runDailyRecovery);

router.get('/config/late-fee', authRequired, config.getLateFee);
router.put('/config/late-fee', authRequired, config.setLateFee);

router.get('/workflows/active', authRequired, workflow.getActiveWorkflow);
router.post('/workflows', authRequired, workflow.createWorkflow);

export default router;
