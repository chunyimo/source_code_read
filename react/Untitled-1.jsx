

function render(element, container, callback) {
  // ...
  return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
}



function unbatchedUpdates(fn, a) {
  // ...
  try {
    return fn(a);
  } finally {
    // ...
    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
  }
}

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  //...
  let root = container._reactRootContainer;
  let fiberRoot;
  if (!root) {
    // Initial mount、
    // ... 首次挂载，创建rooFiber
    // Initial mount should not be batched.

    unbatchedUpdates(function () {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
     // Update
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}


function flushSyncCallbackQueue() {
  // ...
  flushSyncCallbackQueueImpl();
}

function flushSyncCallbackQueueImpl() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    // Prevent re-entrancy.
    isFlushingSyncQueue = true;
    let i = 0;
    {
      try {
        let _isSync2 = true;
        let _queue = syncQueue;
        runWithPriority$1(ImmediatePriority$1, function () {
          for (; i < _queue.length; i++) {
            let callback = _queue[i];

            do {
              callback = callback(_isSync2);
            } while (callback !== null);
          }
        });
        syncQueue = null;
      } catch (error) {
        // If something throws, leave the remaining callbacks on the queue.
        if (syncQueue !== null) {
          syncQueue = syncQueue.slice(i + 1);
        }
        // Resume flushing in the next tick
        // 调度失败后继续，把任务推到scheduler中，等待被执行
        Scheduler_scheduleCallback(Scheduler_ImmediatePriority, flushSyncCallbackQueue);
        throw error;
      } finally {
        isFlushingSyncQueue = false;
      }
    }
  }
}


function updateContainer(element, container, parentComponent, callback) {
  // ...
  // 获取优先级
  let lane = requestUpdateLane(current$1);

  //...

  // 创建update任务
  let update = createUpdate(eventTime, lane);
  // Caution: React DevTools currently depends on this property
  // being called "element".

  update.payload = {
    element: element
  };
  callback = callback === undefined ? null : callback;

  if (callback !== null) {
    // ...
    update.callback = callback;
  }
  // update任务环链
  enqueueUpdate(current$1, update);
  scheduleUpdateOnFiber(current$1, lane, eventTime);
  return lane;
}



// @ts-ignore

function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.subtreeTag = NoSubtreeEffect;
  this.deletions = null;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;

  // ...
}
