import { CanonicalPaperSchema } from '@/types/paper-schema';
import { CanonicalPaperZodSchema } from '@/lib/schema/paper.schema';

import lenetPaperData from '@/data/papers/lenet-1998-ieee-lecun.json';
import alexnetPaperData from '@/data/papers/alexnet-2012-nips-krizhevsky.json';
import vggPaperData from '@/data/papers/vgg-2014-arxiv-simonyan.json';
import inceptionPaperData from '@/data/papers/inceptionv3-2015-cvpr-szegedy.json';
import resnetPaperData from '@/data/papers/resnet-2015-cvpr-he.json';
import resnetv2PaperData from '@/data/papers/resnetv2-2016-eccv-he.json';
import densenetPaperData from '@/data/papers/densenet-2016-cvpr-huang.json';
import xceptionPaperData from '@/data/papers/xception-2016-cvpr-chollet.json';
import inceptionresnetv2PaperData from '@/data/papers/inceptionresnetv2-2016-aaai-szegedy.json';
import mobilenetv1PaperData from '@/data/papers/mobilenetv1-2017-arxiv-howard.json';
import nasnetPaperData from '@/data/papers/nasnet-2017-cvpr-zoph.json';
import mobilenetv2PaperData from '@/data/papers/mobilenetv2-2018-cvpr-sandler.json';
import mobilenetv3PaperData from '@/data/papers/mobilenetv3-2019-iccv-howard.json';
import efficientnetPaperData from '@/data/papers/efficientnet-2019-icml-tan.json';
import vitPaperData from '@/data/papers/vit-2020-iclr-dosovitskiy.json';
import swinPaperData from '@/data/papers/swin-2021-iccv-liu.json';
import convnextPaperData from '@/data/papers/convnext-2022-cvpr-liu.json';
import maxvitPaperData from '@/data/papers/maxvit-2022-eccv-chen.json';

// In-memory static paper registry mapping paperId & alias slugs -> CanonicalPaperSchema
const STATIC_PAPERS_REGISTRY: Record<string, unknown> = {
  // 1. LeNet
  'lenet-1998-ieee-lecun': lenetPaperData,
  'lenet': lenetPaperData,

  // 2. AlexNet
  'alexnet-2012-nips-krizhevsky': alexnetPaperData,
  'alexnet': alexnetPaperData,

  // 3. VGG
  'vgg-2014-arxiv-simonyan': vggPaperData,
  'vgg': vggPaperData,
  'vgg16': vggPaperData,
  'vgg19': vggPaperData,

  // 4. InceptionV3
  'inceptionv3-2015-cvpr-szegedy': inceptionPaperData,
  'inception': inceptionPaperData,
  'inceptionv3': inceptionPaperData,

  // 5. ResNet
  'resnet-2015-cvpr-he': resnetPaperData,
  'resnet': resnetPaperData,
  'resnet50': resnetPaperData,

  // 6. ResNet V2
  'resnetv2-2016-eccv-he': resnetv2PaperData,
  'resnetv2': resnetv2PaperData,
  'resnet50v2': resnetv2PaperData,

  // 7. DenseNet
  'densenet-2016-cvpr-huang': densenetPaperData,
  'densenet': densenetPaperData,
  'densenet121': densenetPaperData,

  // 8. Xception
  'xception-2016-cvpr-chollet': xceptionPaperData,
  'xception': xceptionPaperData,

  // 9. Inception-ResNet-v2
  'inceptionresnetv2-2016-aaai-szegedy': inceptionresnetv2PaperData,
  'inceptionresnetv2': inceptionresnetv2PaperData,

  // 10. MobileNetV1
  'mobilenetv1-2017-arxiv-howard': mobilenetv1PaperData,
  'mobilenetv1': mobilenetv1PaperData,

  // 11. NASNet
  'nasnet-2017-cvpr-zoph': nasnetPaperData,
  'nasnet': nasnetPaperData,
  'nasnetmobile': nasnetPaperData,

  // 12. MobileNetV2
  'mobilenetv2-2018-cvpr-sandler': mobilenetv2PaperData,
  'mobilenet': mobilenetv2PaperData,
  'mobilenetv2': mobilenetv2PaperData,

  // 13. MobileNetV3
  'mobilenetv3-2019-iccv-howard': mobilenetv3PaperData,
  'mobilenetv3': mobilenetv3PaperData,
  'mobilenetv3small': mobilenetv3PaperData,

  // 14. EfficientNet
  'efficientnet-2019-icml-tan': efficientnetPaperData,
  'efficientnet': efficientnetPaperData,
  'efficientnetb0': efficientnetPaperData,

  // 15. Vision Transformer (ViT)
  'vit-2020-iclr-dosovitskiy': vitPaperData,
  'vit': vitPaperData,

  // 16. Swin Transformer
  'swin-2021-iccv-liu': swinPaperData,
  'swin': swinPaperData,

  // 17. ConvNeXt
  'convnext-2022-cvpr-liu': convnextPaperData,
  'convnext': convnextPaperData,

  // 18. MaxViT
  'maxvit-2022-eccv-chen': maxvitPaperData,
  'maxvit': maxvitPaperData,
};

/**
 * Fetch paper details by paper ID or canonical slug.
 * Returns normalized and validated CanonicalPaperSchema object.
 */
export async function getPaperById(paperId: string): Promise<CanonicalPaperSchema | null> {
  const rawData = STATIC_PAPERS_REGISTRY[paperId];
  
  if (!rawData) {
    return null;
  }

  const result = CanonicalPaperZodSchema.safeParse(rawData);
  if (!result.success) {
    console.error(`Paper validation error for ID "${paperId}":`, result.error.issues);
    return rawData as CanonicalPaperSchema;
  }

  return result.data as CanonicalPaperSchema;
}

/**
 * Return all canonical paper IDs and alias slugs for static route compilation.
 */
export function getAllPaperIds(): string[] {
  return Array.from(Object.keys(STATIC_PAPERS_REGISTRY));
}
