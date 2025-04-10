(function() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const requestsMap = new WeakMap();
  let requestCounter = 0;
  
  const config = {
    showUrl: true,                // URL 표시 여부
    showMethod: true,             // 메소드 표시 여부
    showRequestHeaders: true,     // 요청 헤더 표시 여부
    showCookies: true,            // 쿠키 표시 여부
    showRequestData: true,        // 요청 데이터 표시 여부
    expandFormData: true,         // FormData 내용 펼쳐서 표시 여부
    parseJsonData: true,          // JSON 데이터 파싱하여 표시 여부
    showResponseStatus: true,     // 응답 상태 코드 표시 여부
    showResponseHeaders: true,    // 응답 헤더 표시 여부
    showResponseData: true,       // 응답 데이터 표시 여부
    responseDataMaxLength: 0,     // 응답 데이터 최대 길이 (0이면 제한 없음)
    decodeUnicode: true,          // 유니코드 변환 시도 여부
    showDuration: true            // 요청 소요 시간 표시 여부
  };

  // 쿠키를 JSON 객체로 변환하는 함수
  function cookieToJson() {
    const cookieObj = {};
    document.cookie.split(/\s*;\s*/).forEach(function(pair) {
      if (pair) {
        const parts = pair.split(/\s*=\s*/);
        if (parts.length >= 2) {
          cookieObj[parts[0]] = parts.slice(1).join('=');
        }
      }
    });
    return cookieObj;
  }

  XMLHttpRequest.prototype.open = function(method, url) {
    const requestId = ++requestCounter;
    requestsMap.set(this, { 
      id: requestId,
      method, 
      url, 
      headers: {}, 
      startTime: Date.now(),
      pending: true
    });
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    const requestInfo = requestsMap.get(this);
    if (requestInfo) {
      requestInfo.headers[header] = value;
    }
    return originalSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(data) {
    const requestInfo = requestsMap.get(this);
    if (requestInfo) {
      requestInfo.data = data;
      
      // 요청 데이터 저장
      if (config.showRequestData) {
        if (data instanceof FormData) {
          if (config.expandFormData) {
            const formDataObj = {};
            for (let pair of data.entries()) {
              formDataObj[pair[0]] = pair[1];
            }
            requestInfo.formData = formDataObj;
          } else {
            requestInfo.requestData = "[FormData]";
          }
        } else if (typeof data === 'string' && config.parseJsonData && data.trim().startsWith('{')) {
          try {
            requestInfo.requestData = JSON.parse(data);
          } catch (e) {
            requestInfo.requestData = data;
          }
        } else {
          requestInfo.requestData = data;
        }
      }
    }

    const originalOnReadyStateChange = this.onreadystatechange;
    
    this.onreadystatechange = function() {
      if (this.readyState === 4) {
        const requestInfo = requestsMap.get(this);
        if (requestInfo && requestInfo.pending) {
          requestInfo.pending = false;
          const duration = Date.now() - requestInfo.startTime;
          
          // 통합 로그 객체 생성
          const logObj = {
            id: requestInfo.id,
            request: {},
            response: {}
          };
          
          // 공통 정보
          if (config.showMethod) logObj.method = requestInfo.method;
          if (config.showUrl) logObj.url = requestInfo.url;
          if (config.showDuration) logObj.duration = duration + 'ms';
          
          // 요청 정보 추가
          if (config.showRequestHeaders) logObj.request.headers = requestInfo.headers;
          if (config.showCookies) logObj.request.cookies = cookieToJson();
          
          // 요청 데이터 추가
          if (config.showRequestData) {
            if (requestInfo.formData) {
              logObj.request.data = requestInfo.formData;
            } else if (requestInfo.requestData) {
              logObj.request.data = requestInfo.requestData;
            }
          }
          
          // 응답 정보 추가
          if (config.showResponseStatus) logObj.response.status = this.status;
          
          // 응답 헤더 추가
          if (config.showResponseHeaders) {
            const headerObj = {};
            const headerString = this.getAllResponseHeaders();
            const headers = headerString.split('\r\n');
            headers.forEach(header => {
              if (header) {
                const parts = header.split(': ');
                if (parts.length === 2) {
                  headerObj[parts[0]] = parts[1];
                }
              }
            });
            logObj.response.headers = headerObj;
          }
          
          // 응답 데이터 추가
          if (config.showResponseData) {
            try {
              let responseData = this.responseText;
              
              if (config.responseDataMaxLength > 0 && responseData.length > config.responseDataMaxLength) {
                logObj.response.data = responseData.substring(0, config.responseDataMaxLength) + '...';
                logObj.response.truncated = true;
                logObj.response.fullLength = responseData.length;
              } else {
                if (this.getResponseHeader('Content-Type') && 
                    this.getResponseHeader('Content-Type').includes('application/json')) {
                  try {
                    logObj.response.data = JSON.parse(responseData);
                  } catch (e) {
                    logObj.response.data = responseData;
                  }
                } else if (responseData && responseData.includes('\\u') && config.decodeUnicode) {
                  try {
                    logObj.response.data = JSON.parse(`"${responseData.replace(/"/g, '\\"')}"`);
                    logObj.response.decoded = true;
                  } catch (e) {
                    logObj.response.data = responseData;
                  }
                } else {
                  logObj.response.data = responseData;
                }
              }
            } catch (e) {
              logObj.response.error = e.message;
            }
          }
          
          // 통합 로그 출력
          // console.log(`XHR #${logObj.id}: ${logObj.method} ${logObj.url} (${logObj.duration})`, logObj);
          console.log(`XHR #${this.status}:`, logObj.method, logObj.url, `(${logObj.duration})`);
          console.log(`request:`, logObj.request);
          console.log(`response:`, logObj.response);
        }
      }
      
      if (typeof originalOnReadyStateChange === 'function') {
        originalOnReadyStateChange.apply(this, arguments);
      }
    };
    
    return originalSend.apply(this, arguments);
  };
  
  console.log('[XHR Interceptor] Initialized with unified request/response logging');
})();
