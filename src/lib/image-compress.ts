/**
 * In-browser Image Compressor using native HTML5 Canvas
 * 
 * Mengompres foto bukti transfer (dari kamera HP 3MB–8MB) menjadi ~30KB–60KB
 * sebelum disimpan ke Firestore, tanpa melampaui batas dokumen 1MB.
 * Teks nominal, tanggal, dan nomor referensi transfer tetap tajam dan terbaca jelas.
 */

export interface CompressionResult {
  base64: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImageInBrowser(
  file: File,
  maxWidth = 900,
  maxHeight = 1200,
  quality = 0.72
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Format gambar tidak didukung'));

      img.onload = () => {
        let { width, height } = img;

        // Hitung skala proporsional
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Browser tidak mendukung Canvas 2D'));
          return;
        }

        // Latar putih untuk mencegah transparansi PNG menjadi hitam saat diekspor ke JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Gambar ulang dengan smoothing aktif untuk ketajaman teks struk
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke JPEG terkompresi
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        const compressedBytes = Math.round((compressedBase64.length * 3) / 4);
        const compressedSizeKb = Math.round(compressedBytes / 1024);

        resolve({
          base64: compressedBase64,
          originalSizeKb,
          compressedSizeKb,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
