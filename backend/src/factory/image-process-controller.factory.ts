import ImageProcessController from "../controllers/image-process-job-controller";
import ImageProcessServiceFactory from "./image-process-service.factory";

class ImageProcessControllerFactory implements IFactory<ImageProcessController> {
    create(): ImageProcessController {
        const imageProcessService = new ImageProcessServiceFactory().create();
        return new ImageProcessController(imageProcessService);
    }
}

export default ImageProcessControllerFactory