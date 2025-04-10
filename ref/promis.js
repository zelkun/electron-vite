// 원본 Promise 메서드 저장
const originalThen = Promise.prototype.then;
const originalCatch = Promise.prototype.catch;
const originalFinally = Promise.prototype.finally;
const originalPromiseConstructor = window.Promise;

// 모니터링 데이터 저장소
const promiseMonitor = {
  activePromises: new Map(),
  completedPromises: [],
  rejectedPromises: [],
  stats: {
    created: 0,
    resolved: 0,
    rejected: 0,
    averageResolutionTime: 0,
    maxChainDepth: 0,
    currentChainDepth: 0
  }
};

// 고유 ID 생성 함수
function generatePromiseId() {
  return Math.random().toString(36).substr(2, 9);
}

// Promise 생성자 후킹
window.Promise = function(executor) {
  const promiseId = generatePromiseId();
  const creationTime = performance.now();
  const creationStack = new Error().stack;
  
  promiseMonitor.stats.created++;
  
  // 원본 생성자 호출 시 executor를 래핑
  const promise = new originalPromiseConstructor((resolve, reject) => {
    const wrappedResolve = (value) => {
      const resolutionTime = performance.now() - creationTime;
      
      promiseMonitor.stats.resolved++;
      promiseMonitor.activePromises.delete(promiseId);
      promiseMonitor.completedPromises.push({
        id: promiseId,
        creationTime,
        resolutionTime,
        value,
        stack: creationStack
      });
      
      // 평균 해결 시간 업데이트
      const totalResolved = promiseMonitor.stats.resolved;
      const currentAvg = promiseMonitor.stats.averageResolutionTime;
      promiseMonitor.stats.averageResolutionTime = 
        (currentAvg * (totalResolved - 1) + resolutionTime) / totalResolved;
      
      console.log(`Promise ${promiseId} resolved in ${resolutionTime.toFixed(2)}ms with value:`, value);
      return resolve(value);
    };
    
    const wrappedReject = (reason) => {
      const rejectionTime = performance.now() - creationTime;
      
      promiseMonitor.stats.rejected++;
      promiseMonitor.activePromises.delete(promiseId);
      promiseMonitor.rejectedPromises.push({
        id: promiseId,
        creationTime,
        rejectionTime,
        reason,
        stack: creationStack
      });
      
      console.error(`Promise ${promiseId} rejected in ${rejectionTime.toFixed(2)}ms with reason:`, reason);
      return reject(reason);
    };
    
    // 활성 Promise 추적
    promiseMonitor.activePromises.set(promiseId, {
      id: promiseId,
      creationTime,
      stack: creationStack
    });
    
    try {
      return executor(wrappedResolve, wrappedReject);
    } catch (error) {
      console.error(`Promise ${promiseId} executor threw an error:`, error);
      return wrappedReject(error);
    }
  });
  
  return promise;
};

// 프로토타입과 정적 메서드 복사
window.Promise.prototype = originalPromiseConstructor.prototype;
window.Promise.all = originalPromiseConstructor.all;
window.Promise.race = originalPromiseConstructor.race;
window.Promise.resolve = originalPromiseConstructor.resolve;
window.Promise.reject = originalPromiseConstructor.reject;
window.Promise.allSettled = originalPromiseConstructor.allSettled;

// then 메서드 후킹 - 체인 깊이 추적 포함
Promise.prototype.then = function(onFulfilled, onRejected) {
  const promiseId = generatePromiseId();
  const startTime = performance.now();
  
  // 체인 깊이 추적
  promiseMonitor.stats.currentChainDepth++;
  if (promiseMonitor.stats.currentChainDepth > promiseMonitor.stats.maxChainDepth) {
    promiseMonitor.stats.maxChainDepth = promiseMonitor.stats.currentChainDepth;
  }
  
  const currentDepth = promiseMonitor.stats.currentChainDepth;
  console.log(`Promise.then 호출 (ID: ${promiseId}, 체인 깊이: ${currentDepth})`);
  
  // onFulfilled와 onRejected 콜백 래핑
  const wrappedOnFulfilled = onFulfilled 
    ? (value) => {
        const executionTime = performance.now() - startTime;
        console.log(`Promise.then onFulfilled 실행 (ID: ${promiseId}, 체인 깊이: ${currentDepth}, 실행 시간: ${executionTime.toFixed(2)}ms)`, value);
        
        try {
          const result = onFulfilled(value);
          promiseMonitor.stats.currentChainDepth--;
          return result;
        } catch (error) {
          promiseMonitor.stats.currentChainDepth--;
          console.error(`Promise.then onFulfilled 오류 (ID: ${promiseId}):`, error);
          throw error;
        }
      } 
    : (value) => {
        promiseMonitor.stats.currentChainDepth--;
        return value;
      };
  
  const wrappedOnRejected = onRejected 
    ? (reason) => {
        const executionTime = performance.now() - startTime;
        console.log(`Promise.then onRejected 실행 (ID: ${promiseId}, 체인 깊이: ${currentDepth}, 실행 시간: ${executionTime.toFixed(2)}ms)`, reason);
        
        try {
          const result = onRejected(reason);
          promiseMonitor.stats.currentChainDepth--;
          return result;
        } catch (error) {
          promiseMonitor.stats.currentChainDepth--;
          console.error(`Promise.then onRejected 오류 (ID: ${promiseId}):`, error);
          throw error;
        }
      } 
    : (reason) => {
        promiseMonitor.stats.currentChainDepth--;
        throw reason;
      };
  
  return originalThen.call(this, wrappedOnFulfilled, wrappedOnRejected);
};

// catch 메서드 후킹
Promise.prototype.catch = function(onRejected) {
  const promiseId = generatePromiseId();
  const startTime = performance.now();
  
  console.log(`Promise.catch 호출 (ID: ${promiseId})`);
  
  const wrappedOnRejected = onRejected 
    ? (reason) => {
        const executionTime = performance.now() - startTime;
        console.log(`Promise.catch 실행 (ID: ${promiseId}, 실행 시간: ${executionTime.toFixed(2)}ms)`, reason);
        
        try {
          return onRejected(reason);
        } catch (error) {
          console.error(`Promise.catch 오류 (ID: ${promiseId}):`, error);
          throw error;
        }
      } 
    : undefined;
  
  return originalCatch.call(this, wrappedOnRejected);
};

// finally 메서드 후킹
Promise.prototype.finally = function(onFinally) {
  const promiseId = generatePromiseId();
  const startTime = performance.now();
  
  console.log(`Promise.finally 호출 (ID: ${promiseId})`);
  
  const wrappedOnFinally = onFinally 
    ? () => {
        const executionTime = performance.now() - startTime;
        console.log(`Promise.finally 실행 (ID: ${promiseId}, 실행 시간: ${executionTime.toFixed(2)}ms)`);
        
        try {
          return onFinally();
        } catch (error) {
          console.error(`Promise.finally 오류 (ID: ${promiseId}):`, error);
          throw error;
        }
      } 
    : undefined;
  
  return originalFinally.call(this, wrappedOnFinally);
};

// 모니터링 API 제공
window.PromiseMonitor = {
  // 현재 통계 가져오기
  getStats: () => ({ ...promiseMonitor.stats }),
  
  // 활성 Promise 목록 가져오기
  getActivePromises: () => Array.from(promiseMonitor.activePromises.values()),
  
  // 완료된 Promise 목록 가져오기
  getCompletedPromises: () => [...promiseMonitor.completedPromises],
  
  // 거부된 Promise 목록 가져오기
  getRejectedPromises: () => [...promiseMonitor.rejectedPromises],
  
  // 통계 초기화
  resetStats: () => {
    promiseMonitor.stats = {
      created: 0,
      resolved: 0,
      rejected: 0,
      averageResolutionTime: 0,
      maxChainDepth: 0,
      currentChainDepth: 0
    };
    promiseMonitor.completedPromises = [];
    promiseMonitor.rejectedPromises = [];
  },
  
  // 특정 시간 이상 걸린 Promise 찾기
  findSlowPromises: (thresholdMs) => {
    return [
      ...promiseMonitor.completedPromises.filter(p => p.resolutionTime > thresholdMs),
      ...promiseMonitor.rejectedPromises.filter(p => p.rejectionTime > thresholdMs)
    ];
  }
};

// 처리되지 않은 Promise 거부 감지
window.addEventListener('unhandledrejection', function(event) {
  console.warn('처리되지 않은 Promise 거부 감지:', event.reason);
  console.warn('Promise:', event.promise);
});

console.log('Promise 고급 모니터링이 활성화되었습니다. window.PromiseMonitor를 통해 접근하세요.');
