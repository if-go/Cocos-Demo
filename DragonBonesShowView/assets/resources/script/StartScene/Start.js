// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        dragonBonesPrefab: {
            type: cc.Node,
            default: null,
        },
    },

    onLoad() {
        this.loadAllDragonBones()
    },
    // 加载所有龙骨资源
    loadAllDragonBones() {
        cc.loader.loadResDir("./dragonBones", dragonBones.DragonBonesAsset, (err, assets) => {
            if (err) {
                cc.error("Failed to load dragonbones:", err);
                return;
            }

            cc.loader.loadResDir("./dragonBones", dragonBones.DragonBonesAtlasAsset, (err, atlasAssets) => {
                if (err) {
                    cc.error("Failed to load dragonbones atlas:", err);
                    return;
                }

                for (let i = 0; i < assets.length; i++) {
                    // 创建龙骨组件
                    const node = cc.instantiate(this.dragonBonesPrefab);

                    const dragonBonesComp = node.getComponent(dragonBones.ArmatureDisplay);
                    if (!dragonBonesComp) node.addComponent(dragonBones.ArmatureDisplay)
                    dragonBonesComp = node.getComponent(dragonBones.ArmatureDisplay)

                    dragonBonesComp.dragonAsset = assets[i];
                    dragonBonesComp.dragonAtlasAsset = atlasAssets[i];
                    dragonBonesComp.armatureName = "armatureName"; // 修改为龙骨动画的名称

                    // 添加到场景中
                    this.node.addChild(node);
                }
            });
        });
    }
});
