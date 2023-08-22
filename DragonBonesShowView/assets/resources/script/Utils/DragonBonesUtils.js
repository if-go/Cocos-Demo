// 龙骨辅助类
window.WriteLevel_Utils_DragonBones = cc.Class({

    statics: {
        // 获取龙骨对应组件
        getArmatureDisplay(node) {
            let armatureDisplay = node.getComponent(dragonBones.ArmatureDisplay);
            return armatureDisplay;
        },

        getSlot(node, slotName) {
            //如果node.active==false，则会返回undefined
            let armatureDisplay = this.getArmatureDisplay(node)
            let armature = armatureDisplay?.armature();
            let slot = armature?.getSlot(slotName);

            if (!slot) {
                cc.warn('WriteLevel_Utils_DragonBones >> getSlot', node.name, '节点不存在，或节点隐藏了，或插槽名字写错');
            }

            return slot
        },

        getBone(node, nodeName) {
            let armatureDisplay = this.getArmatureDisplay(node)
            let armature = armatureDisplay?.armature();
            let bone = armature?.getBone(nodeName)

            if (!bone) {
                cc.warn('WriteLevel_Utils_DragonBones getBone >> ', node.name, '节点不存在，或节点隐藏了，或骨骼名字写错');
            }

            return bone
        },

        // 获取骨骼角度
        getBoneRotation(node, nodeName) {
            let bone = this.getBone(node, nodeName)
            let angle = 0
            if (bone) {
                angle = MathUtils.Radian2Angle(bone.boneData.transform.rotation)
            }
            else {
                cc.warn("骨骼不存在，使用默认值：0")
            }

            return angle
        },

        isAni(node) {
            let armatureDisplay = WriteLevel_Utils_DragonBones.getArmatureDisplay(node);
            if (armatureDisplay == null) {
                return false
            }
            return true
        },

        /**
        animName 指定播放动画的名称。
        playTimes 指定播放动画的次数。
        -1 为使用配置文件中的次数。
        0 为无限循环播放。
        >0 为动画的重复次数。
         */
        play(node, animName, playTimes = 1) {
            let armatureDisplay = WriteLevel_Utils_DragonBones.getArmatureDisplay(node);
            if (armatureDisplay == null) {
                console.warn('WriteLevel_Utils_DragonBones armatureDisplay == null');
                return
            }
            armatureDisplay.playAnimation(animName, playTimes);
        },

        /**
         * 播放一次,目的是自动释放事件
         * 不希望名字太长,加了个X算了
         */
        playOnceX(node, name, completeCallback) {
            this.removeAllEvent(node)
            this.playOnce(node, name, completeCallback)
        },

        /**
         * 
         * @param {*} node 
         * @param {*} name 
         * @param {*} fadeTime 渐变时间
         * @param {*} times 次数
         * @param {*} completeCallback 
         */
        playOnceXFade(node, name, fadeTime, completeCallback) {
            this.removeAllEvent(node)
            let com = node.getComponent(dragonBones.ArmatureDisplay)
            var armature = com.armature();
            var animation = armature.animation;
            let state = animation.fadeIn(name, fadeTime, 1)
            state.resetToPose = false
            com.addEventListener(dragonBones.EventObject.COMPLETE, completeCallback, node)
        },

        playOnce(node, name, completeCallback) {
            if (!this.isHasAnimation(node, name)) {
                console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', name);
                completeCallback && completeCallback()
                return
            }
            Log.log('WriteLevel_Utils_DragonBones playOnce 播放动作', name);
            let com = node.getComponent(dragonBones.ArmatureDisplay)
            com.playAnimation(name, 1)

            let func = function (event) {
                // console.info('DBoneTS >>>>>>>> 26 event =',event.type);
                completeCallback && completeCallback(event)
            }

            com.addEventListener(dragonBones.EventObject.COMPLETE, func, node)
        },

        playLoopX(node, name, completeCallback) {
            this.removeAllEvent(node)
            this.playLoop(node, name, completeCallback)
        },
        //设置播放速度
        setSpeed(node, scale = 1) {
            let com = node.getComponent(dragonBones.ArmatureDisplay)
            com.timeScale = scale
        },

        /**
         * 
         * @param {*} node 
         * @param {*} name 
         * @param {*} fadeTime 渐变时间
         * @param {*} times 次数
         * @param {*} completeCallback 
         */
        playLoopXFade(node, name, fadeTime, completeCallback) {
            this.removeAllEvent(node)
            let com = node.getComponent(dragonBones.ArmatureDisplay)
            var armature = com.armature();
            var animation = armature.animation;
            let state = animation.fadeIn(name, fadeTime, -1)
            state.resetToPose = false
            if (completeCallback) {
                com.addEventListener(dragonBones.EventObject.COMPLETE, completeCallback, node)
            }
        },

        playLoop(node, name, completeCallback) {
            if (!this.isHasAnimation(node, name)) {
                console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', name);
                completeCallback && completeCallback()
                return
            }
            let com = node.getComponent(dragonBones.ArmatureDisplay)

            Log.log('WriteLevel_Utils_DragonBones playLoop 播放动作', name);
            com.playAnimation(name, 0)

            let func = function (event) {
                // console.info('DBoneTS >>>>>>>> 26 event =',event.type);
                completeCallback && completeCallback(event)
            }

            com.addEventListener(dragonBones.EventObject.LOOP_COMPLETE, func, node)
        },

        //播放动画数组
        playMulAni(node, nameList, changeCallback, completeCallback) {
            let com = node.getComponent(dragonBones.ArmatureDisplay)

            let index = 0
            com.playAnimation(nameList[index], 1)

            let func = function (event) {
                // console.info('DBoneTS >>>>>>>> 26 event =',event.type);
                index++
                if (nameList[index]) {
                    changeCallback && changeCallback(index)
                    if (!this.isHasAnimation(node, nameList[index])) {
                        console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', nameList[index]);
                        return
                    }
                    com.playAnimation(nameList[index], 1)
                } else {
                    completeCallback && completeCallback()
                }
            }

            com.addEventListener(dragonBones.EventObject.COMPLETE, func, node)
        },

        //循环播放动画数组
        playMulAniLoop(node, nameList, changeCallback) {
            let com = node.getComponent(dragonBones.ArmatureDisplay)

            let index = 0
            com.playAnimation(nameList[index], 1)

            let func = function (event) {
                index = (index + 1) % nameList.length
                changeCallback && changeCallback(index)
                if (!this.isHasAnimation(node, nameList[index])) {
                    console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', nameList[index]);
                    return
                }
                com.playAnimation(nameList[index], 1)
            }

            com.addEventListener(dragonBones.EventObject.COMPLETE, func, node)
        },


        //循环播放动画数组,最后一个播放循环
        playMulAniAndLastLoop(node, ...nameList) {
            let com = node.getComponent(dragonBones.ArmatureDisplay)

            let index = 0
            com.playAnimation(nameList[index], 1)
            let self = this
            let func = function (event) {
                index = (index + 1) % nameList.length
                if (!self.isHasAnimation(node, nameList[index])) {
                    console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', nameList[index]);
                    return
                }
                if (index == nameList.length - 1) {
                    com.playAnimation(nameList[index], 1)
                } else {
                    com.playAnimation(nameList[index], 0)
                    com.removeEventListener(dragonBones.EventObject.COMPLETE);
                }
            }

            com.addEventListener(dragonBones.EventObject.COMPLETE, func, node)
        },

        addAllEvent(node, eventCallback) {
            let com = node.getComponent(dragonBones.ArmatureDisplay)

            let func = function (event) {
                // console.info('DBoneTS >>>>>>>> 26 event =',event.type);
                eventCallback && eventCallback(event)
            }

            com.addEventListener(dragonBones.EventObject.START, func, node)
            com.addEventListener(dragonBones.EventObject.LOOP_COMPLETE, func, node)
            com.addEventListener(dragonBones.EventObject.COMPLETE, func, node)
            com.addEventListener(dragonBones.EventObject.FADE_IN, func, node)
            com.addEventListener(dragonBones.EventObject.FADE_IN_COMPLETE, func, node)
            com.addEventListener(dragonBones.EventObject.FADE_OUT, func, node)
            com.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, func, node)
            com.addEventListener(dragonBones.EventObject.FRAME_EVENT, func, node)
            com.addEventListener(dragonBones.EventObject.SOUND_EVENT, func, node)
        },

        removeAllEvent(armatureDisplayNode, eventArr = ["START", "LOOP_COMPLETE", "COMPLETE", "FADE_IN", "FADE_IN_COMPLETE", "FADE_OUT", "FADE_OUT_COMPLETE", "FRAME_EVENT", "SOUND_EVENT"]) {
            let com = armatureDisplayNode.getComponent(dragonBones.ArmatureDisplay)
            for (let index = 0; index < eventArr.length; index++) {
                const eventName = eventArr[index];
                com.removeEventListener(dragonBones.EventObject[eventName]);
            }
        },


        isHasAnimation(node, aniName) {
            let com = this.getArmatureDisplay(node)
            let nameList = com.getAnimationNames(com.armatureName)
            cc.log('WriteLevel_Utils_DragonBones >> name: ', node.name, ' nameList:', nameList, ' aniName: ', aniName);
            return ArrayUtils.isInside(nameList, aniName)
        },

        /**
         * author Dong
         * @param {*} node 
         * @param {*} name 
         * @param {*} frameCallback 
         * @returns 
         */
        playOnceAndHandleFrameEvent(node, name, frameCallback, isPlay = true) {
            if (!this.isHasAnimation(node, name)) {
                console.error('WriteLevel_Utils_DragonBones 没有这个动作名字', name);
                completeCallback && completeCallback()
                return
            }
            let com = node.getComponent(dragonBones.ArmatureDisplay)
            if (isPlay) {
                com.playAnimation(name, 1)
            }

            let func = function (event) {
                frameCallback && frameCallback(event)
            }

            com.addEventListener(dragonBones.EventObject.FRAME_EVENT, func, node)
        },

        // 循环播放，dt秒后回调
        playLoopXByTimeCb(node, name, dt = 0.5, cb) {
            WriteLevel_Utils_DragonBones.playLoopX(node, name);
            let com = this.getArmatureDisplay(node);
            com.scheduleOnce(() => {
                cb && cb();
            }, dt);
        },

        // 播放一次，dt秒后回调
        playOnceXByTimeCb(node, name, dt = 0.5, cb) {
            WriteLevel_Utils_DragonBones.playOnceX(node, name);
            let com = this.getArmatureDisplay(node);
            com.scheduleOnce(() => {
                cb && cb();
            }, dt);
        },

        // 播放N次后，回调
        playOnceXByCountCb(node, name, counts = 1, cb) {
            let index = 0;
            let onceXFun = (onceCb) => {
                index++;
                WriteLevel_Utils_DragonBones.playOnceX(node, name, () => {
                    if (index == counts) {
                        onceCb()
                    }
                    else {
                        onceXFun(onceCb)
                    }
                });
            }

            onceXFun(() => {
                cb && cb();
            })
        },

        // 换肤
        // displayIndex: 如果设置为-1，则对应的节点会消失
        changeSoltDisplayIndex(node, slotName, displayIndex) {
            let slot = this.getSlot(node, slotName)
            if (slot) {
                cc.log('WriteLevel_Utils_DragonBones >> ', node.name, ' displayIndex: ', displayIndex);

                slot.displayIndex = displayIndex
            }
            else {
                cc.warn('WriteLevel_Utils_DragonBones >> 1换槽点失败', node.name, slotName, '节点不存在，或节点隐藏了，或插槽名字写错');
            }
        },

        // 换肤
        setSoltDisplayIndex(slot, displayIndex) {
            if (slot) {
                slot.displayIndex = displayIndex
                cc.log('WriteLevel_Utils_DragonBones >> ', slot.name, ' displayIndex: ', displayIndex);
            }
            else {
                cc.warn('WriteLevel_Utils_DragonBones >> 2换槽点失败 ', '节点不存在，或节点隐藏了，或插槽名字写错');
            }
        },

        changeArrSoltDisplayIndex(node, arrSoltName = [], dpIndex) {
            if (!node) {
                cc.warn('changeArrSoltDisplayIndex >> 节点不存在');
                return
            }
            arrSoltName.forEach((name) => {
                WriteLevel_Utils_DragonBones.changeSoltDisplayIndex(node, name, dpIndex)
            })
        },
    }

});