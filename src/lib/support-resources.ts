// Public console libraries linked by https://sanyilights.us/download-center/.
// These are international libraries; product manuals come from the local catalog.
export const consoleProfiles = [
  { name: 'Avolites', format: 'D4', url: 'https://drive.google.com/drive/folders/1H3S2w8fSs4HkDzk3hCKGBDBYWlfCZLrt' },
  { name: 'MA2 / Avolites', format: 'R20', url: 'https://drive.google.com/drive/folders/1NdQb-oT2jVkmfdlwNPk_4Emo26LhDa7k' },
  { name: 'MA', format: 'XML', url: 'https://drive.google.com/drive/folders/1p-Q-uFjnJhVRc4Aj68hOVt4Ete_w-j3N' },
  { name: 'ChamSys', format: 'HED', url: 'https://drive.google.com/drive/folders/1FFXKjAWJVAxBl640ySKFCm8908rrXq4y' },
  { name: 'Martin', format: 'EXE', url: 'https://drive.google.com/drive/folders/1w4IXZv4C6ciit77N07eGi-h-fP66Feoj' },
];

export function resourceLabel(url: string, index: number): { name: string; format: string } {
  try {
    const path = new URL(url).pathname;
    const filename = decodeURIComponent(path.split('/').pop() || '');
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension);
    return {
      name: extension === 'pdf' ? 'Manual / documento técnico' : isImage ? 'Ficha de especificaciones' : `Archivo ${index + 1}`,
      format: extension.length <= 5 ? extension.toUpperCase() : 'ARCHIVO',
    };
  } catch { return { name: `Archivo ${index + 1}`, format: 'ARCHIVO' }; }
}
