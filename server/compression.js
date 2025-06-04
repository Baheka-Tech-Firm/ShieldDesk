const { createGzip, createDeflate, constants } = require('zlib');

const compressionOptions = {
  level: constants.Z_BEST_COMPRESSION,
  chunkSize: 1024,
  windowBits: 15,
  memLevel: 8
};

const compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  const shouldCompress = (data) => {
    const contentType = res.get('Content-Type') || '';
    const dataSize = Buffer.isBuffer(data) ? data.length : JSON.stringify(data).length;
    
    if (dataSize < 1024) return false;
    if (contentType.includes('image/') || contentType.includes('video/')) return false;
    
    return true;
  };

  const compressData = (data, encoding) => {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
      
      if (encoding === 'gzip') {
        const gzip = createGzip(compressionOptions);
        const chunks = [];
        
        gzip.on('data', chunk => chunks.push(chunk));
        gzip.on('end', () => resolve(Buffer.concat(chunks)));
        gzip.on('error', reject);
        
        gzip.end(buffer);
      } else if (encoding === 'deflate') {
        const deflate = createDeflate(compressionOptions);
        const chunks = [];
        
        deflate.on('data', chunk => chunks.push(chunk));
        deflate.on('end', () => resolve(Buffer.concat(chunks)));
        deflate.on('error', reject);
        
        deflate.end(buffer);
      } else {
        resolve(buffer);
      }
    });
  };

  res.send = function(data) {
    if (!shouldCompress(data)) {
      return originalSend(data);
    }

    let encoding = '';
    if (acceptEncoding.includes('gzip')) {
      encoding = 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      encoding = 'deflate';
    }

    if (!encoding) {
      return originalSend(data);
    }

    compressData(data, encoding)
      .then(compressed => {
        res.set('Content-Encoding', encoding);
        res.set('Vary', 'Accept-Encoding');
        res.set('Content-Length', compressed.length.toString());
        originalSend(compressed);
      })
      .catch(() => originalSend(data));
  };

  res.json = function(data) {
    if (!shouldCompress(data)) {
      return originalJson(data);
    }

    let encoding = '';
    if (acceptEncoding.includes('gzip')) {
      encoding = 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      encoding = 'deflate';
    }

    if (!encoding) {
      return originalJson(data);
    }

    res.set('Content-Type', 'application/json');
    compressData(data, encoding)
      .then(compressed => {
        res.set('Content-Encoding', encoding);
        res.set('Vary', 'Accept-Encoding');
        res.set('Content-Length', compressed.length.toString());
        originalSend(compressed);
      })
      .catch(() => originalJson(data));
  };

  next();
};

module.exports = { compressionMiddleware };