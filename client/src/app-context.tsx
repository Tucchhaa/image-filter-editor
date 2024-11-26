import React, { createContext, useContext, useState } from 'react';
import { ImageHistory } from './editor/image-history';

type AppContextType = {
  imageHistory: ImageHistory;
  addImageToHistory: (imageData: ImageData) => void;
  getLastImage: () => ImageData | null;
  uploadImageToServer: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC = ({ children }) => {
  const [imageHistory] = useState(new ImageHistory());

  const addImageToHistory = (imageData: ImageData) => {
    imageHistory.push(imageData);
  };

  const getLastImage = () => {
    return imageHistory.getLast() || null;
  };

  const uploadImageToServer = async () => {
    const lastImage = getLastImage();
    if (!lastImage) {
      console.error('No image to upload');
      return;
    }

    const blob = await convertImageDataToBlob(lastImage);
    const formData = new FormData();
    formData.append('file', blob, 'image.png');

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        imageHistory,
        addImageToHistory,
        getLastImage,
        uploadImageToServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


const convertImageDataToBlob = async (imageData: ImageData): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context is not available');
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
