export const compressImage = (
  file: File,
  maxWidth = 1440,
  maxHeight = 1440,
  quality = 0.88
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = maxWidth;
        const MAX_HEIGHT = maxHeight;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        // Use webp or jpeg with high fidelity
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const compressBannerImage = (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.92
): Promise<string> => {
  return compressImage(file, maxWidth, maxHeight, quality);
};

export const ensureMultiImages = (product: any): string[] => {
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.filter(Boolean);
    if (valid.length > 1) return valid;
    if (valid.length === 1) {
      const base = valid[0];
      return [
        base,
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
      ];
    }
  }

  const singleImg = product?.image || product?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80";
  return [
    singleImg,
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
  ];
};
