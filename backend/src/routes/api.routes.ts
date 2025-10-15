import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { lendingController } from '@/controllers/lending.controller';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DegenForge Backend API is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Authentication routes
router.post('/auth/connect-wallet', authController.connectWallet.bind(authController));
router.get('/auth/sign-message/:address', authController.getSignMessage.bind(authController));
router.get('/auth/verify-token', authController.verifyToken.bind(authController));
router.post('/auth/refresh-token', authController.refreshToken.bind(authController));
router.get('/auth/wallet-info', authController.getWalletInfo.bind(authController));

// Lending routes
router.post('/lending/deposit', lendingController.depositCollateral.bind(lendingController));
router.post('/lending/mint', lendingController.mintMUSD.bind(lendingController));
router.get('/lending/position/:address', lendingController.getLoanPosition.bind(lendingController));
router.get('/lending/calculate-max', lendingController.calculateMaxMintable.bind(lendingController));
router.get('/lending/risk/:address', lendingController.getRiskAssessment.bind(lendingController));
router.get('/lending/network-status', lendingController.getNetworkStatus.bind(lendingController));

export default router;
