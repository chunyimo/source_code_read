


function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance  作为静态数据结构的属性
  this.tag = tag;  // 对应组件类型 Function/Class/Host
  this.key = key;
  this.elementType = null;
  // 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
  this.type = null;
  this.stateNode = null;

  // Fiber 用于连接其他Fiber节点形成Fiber树
  this.return = null;  // return 执行父节点，取return是指执行完completeWork后会返回的下一个节点
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  // 保存本次更新造成的状态改变相关信息
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  // 对于存在DOM节点的fiber，保存的是一个updatePayload，
  // updatePayload为数组形式，偶坐标为prop key，奇坐标为对应的值。
  this.updateQueue = null;
  // 对于FunctionComponent，memoizedState存储hook的单项链表。
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode; // 模式，如更新的模式是否是异步的(ConcurrentMode)

  // Effects
  // 保存本次更新会造成的DOM操作
  this.effectTag = NoEffect; // 二进制数字，用于标识某个动作
  this.subtreeTag = NoSubtreeEffect;
  this.deletions = null;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;

  // ...
}


currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;

export type Update<State> = {|
  eventTime: number,
  lane: Lane, // 优先级

  tag: 0 | 1 | 2 | 3,  // UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
  payload: any, // 更新挂在的数据，对于ClassComponent，payload为this.setState的第一个参数；
                // 对于HostRoot, payload 为ReactDOM.render的第一个传参
  callback: (() => mixed) | null,

  next: Update<State> | null,
|};


// start HostComponent ClassComponent
export type SharedQueue<State> = {|
  pending: Update<State> | null,
  interleaved: Update<State> | null,
  lanes: Lanes,
|};

export type UpdateQueue<State> = {|
  baseState: State, // 本次更新前该fiber的state，Update基于该state计算更新后的state
  // 本次更新前该fiber节点已保存的Update（优先级较低，上一轮没有被执行到），以链表形式保存下来，firstBaseUpdate为表头
  // lastBaseUpdate为表尾
  firstBaseUpdate: Update<State> | null,
  lastBaseUpdate: Update<State> | null,
  shared: SharedQueue<State>, // shared.pending,触发更新时，产生的Update会保存在shared.pending中，形成单向环状
  // 链表，当由Update计算state时这个环会被剪开并连接在lastBaseUpdate候面。
  // Note: pending指向的时最后一个pending的state
  effects: Array<Update<State>> | null, // 保存update.callback !== null 的Update
|};

// end HostComponent ClassComponent

// start FunctionComponent
type Update<S, A> = {|
  // TODO: Temporary field. Will remove this by storing a map of
  // transition -> start time on the root.
  eventTime: number,
  lane: Lane,
  suspenseConfig: null | SuspenseConfig,
  action: A,
  eagerReducer: ((S, A) => S) | null,
  eagerState: S | null,
  next: Update<S, A>,
  priority?: ReactPriorityLevel,
|};

type UpdateQueue<S, A> = {|
  pending: Update<S, A> | null,
  // 保存dispatchAction.bind()的值
  dispatch: (A => mixed) | null,
  // 上一次render时使用的reducer
  lastRenderedReducer: ((S, A) => S) | null,
  // 上一次render时的state
  lastRenderedState: S | null,
|};
export type Hook = {|
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  // useState he useReducer 可以触发更新的，queue才有可能赋值，像useEffect、useRef为null
  queue: UpdateQueue<any, any> | null,
  next: Hook | null,
|};

// end FunctionComponent