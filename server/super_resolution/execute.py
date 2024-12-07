from PIL import Image
import os
import json
import random
import torchvision.transforms.functional as FT
import torch
import math
import matplotlib.pyplot as plt
import cv2
import numpy as np

from super_resolution.models import SRResNet, Generator


def get_device():
    if torch.cuda.is_available():
        return torch.device("cuda")

    if torch.mps.is_available():
        return torch.device("mps")

    return torch.device("cpu")

device = get_device()

# load models
srresnet = SRResNet()
srresnet_checkpoint = torch.load('./super_resolution/checkpoint_srresnet.pth.tar', map_location=device)
srresnet.load_state_dict(srresnet_checkpoint['model'])
srresnet.eval().to(device)

srgan_generator = Generator()
srgan_checkpoint = torch.load('./super_resolution/checkpoint_srgan.pth.tar', map_location=device)
srgan_generator.load_state_dict(srgan_checkpoint['model'])
srgan_generator.eval().to(device)

# Some constants
rgb_weights = torch.FloatTensor([65.481, 128.553, 24.966]).to(device)
imagenet_mean = torch.FloatTensor([0.485, 0.456, 0.406]).unsqueeze(1).unsqueeze(2)
imagenet_std = torch.FloatTensor([0.229, 0.224, 0.225]).unsqueeze(1).unsqueeze(2)
imagenet_mean_cuda = torch.FloatTensor([0.485, 0.456, 0.406]).to(device).unsqueeze(0).unsqueeze(2).unsqueeze(3)
imagenet_std_cuda = torch.FloatTensor([0.229, 0.224, 0.225]).to(device).unsqueeze(0).unsqueeze(2).unsqueeze(3)


def convert_image(img, source, target):
    """
    Convert an image from a source format to a target format.
    """
    assert source in {'pil', '[0, 1]', '[-1, 1]'}, "Cannot convert from source format %s!" % source
    assert target in {'pil', '[0, 255]', '[0, 1]', '[-1, 1]', 'imagenet-norm',
                      'y-channel'}, "Cannot convert to target format %s!" % target

    # Convert from source to [0, 1]
    if source == 'pil':
        img = FT.to_tensor(img)

    elif source == '[0, 1]':
        pass  # already in [0, 1]

    elif source == '[-1, 1]':
        img = (img + 1.) / 2.

    # Convert from [0, 1] to target
    if target == 'pil':
        img = FT.to_pil_image(img)

    elif target == '[0, 255]':
        img = 255. * img

    elif target == '[0, 1]':
        pass  # already in [0, 1]

    elif target == '[-1, 1]':
        img = 2. * img - 1.

    elif target == 'imagenet-norm':
        if img.ndimension() == 3:
            img = (img - imagenet_mean) / imagenet_std
        elif img.ndimension() == 4:
            img = (img - imagenet_mean_cuda) / imagenet_std_cuda

    elif target == 'y-channel':
        img = torch.matmul(255. * img.permute(0, 2, 3, 1)[:, 4:-4, 4:-4, :], rgb_weights) / 255. + 16.

    return img


def upscale_srresnet(file_obj):
    lr_img = Image.open(file_obj, mode="r").convert("RGB")

    sr_img_srresnet = srresnet(convert_image(lr_img, source='pil', target='imagenet-norm').unsqueeze(0).to(device))
    sr_img_srresnet = sr_img_srresnet.squeeze(0).cpu().detach()
    sr_img_srresnet = convert_image(sr_img_srresnet, source='[-1, 1]', target='pil')
    sr_img_srresnet = sr_img_srresnet.convert('RGB')

    return np.array(sr_img_srresnet)[:,:,::-1].copy()


def upscale_gan(file_obj):
    lr_img = Image.open(file_obj, mode="r").convert("RGB")

    sr_img_srgan = srgan_generator(convert_image(lr_img, source='pil', target='imagenet-norm').unsqueeze(0).to(device))
    sr_img_srgan = sr_img_srgan.squeeze(0).cpu().detach()
    sr_img_srgan = convert_image(sr_img_srgan, source='[-1, 1]', target='pil')
    sr_img_srgan = sr_img_srgan.convert('RGB')

    return np.array(sr_img_srgan)[:,:,::-1].copy()
