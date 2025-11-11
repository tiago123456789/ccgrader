import { Router } from 'express';
import ImageProcessControllerFactory from '../factory/image-process-controller.factory';

const router: Router = Router();
const imageProcessControllerFactory = new ImageProcessControllerFactory();
const imageProcessController = imageProcessControllerFactory.create();

router.post('/jobs', imageProcessController.createImageProcessJob);
router.get('/jobs', imageProcessController.getAll);
router.get('/jobs/:jobId', imageProcessController.findById);
router.get('/jobs/:jobId/signed-url', imageProcessController.getSignedUrlToDownloadFile);


export default router;