


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
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  // 保存本次更新会造成的DOM操作
  this.effectTag = NoEffect;
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
  effects: Array<Update<State>> | null, // 保存update.callback !== null 的Update
|};