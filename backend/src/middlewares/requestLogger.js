// src/middlewares/requestLogger.js
import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 요청 정보 로깅
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    headers: {
      authorization: req.get('Authorization') ? 'Present' : 'Absent',
      contentType: req.get('Content-Type'),
      accept: req.get('Accept'),
    }
  };

  logger.info('Incoming request', logData);

  // 응답 완료 후 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      ...logData,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      duration: `${duration}ms`
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with warning', responseLog);
    } else {
      logger.info('Request completed successfully', responseLog);
    }
  });

  next();
};

export default requestLogger;