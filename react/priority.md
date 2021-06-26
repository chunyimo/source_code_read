## 事件优先级调度机制

> - ensureRootIsScheduled 取消已有的低优先级更新任务，重新调度一个任务去做高优先级更新，并以 root.pendingLanes 中最重要的那部分 lanes 作为渲染优先级
> - 执行更新任务时跳过 updateQueue 中低优先级 update，并将它的 lane 标记到 fiber.lans 中
> - fiber 节点阶段将搜集 root.childLanes 连同 root.lanes 一并赋值给 root.pendingLanes
> - commit 阶段的最后重新发起调度
