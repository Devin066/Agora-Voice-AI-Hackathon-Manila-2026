import * as FileSystem from 'expo-file-system';
import PdfToImage from 'react-native-pdf-to-image';

export const useFileExtractor = () => {

  const convertPdfToImages = async (uri: string): Promise<string[]> => {
    try {
      const internalUri = await prepareFileUri(uri);
      const result = await PdfToImage.convertAllPages(internalUri);
      return result.map((page: { uri: string }) => page.uri);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const prepareFileUri = async (uri: string): Promise<string> => {
    if (uri.startsWith('content://') || uri.startsWith('file://')) {
      const filename = uri.split('/').pop();
      const dest = `${FileSystem.c}${filename}`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    }
    return uri;
  };

  return { convertPdfToImages };
};