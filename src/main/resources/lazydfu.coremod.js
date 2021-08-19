// class imports
var Opcodes = Java.type('org.objectweb.asm.Opcodes');

function initializeCoreMod() {
    return {
        'createFixerUpper': {
            'target': {
                'type': 'METHOD',
                'class': 'net.minecraft.util.datafix.DataFixers',
                'methodName': 'm_14529_',
                'methodDesc': '()Lcom/mojang/datafixers/DataFixer;'
            },
            'transformer': createFixerUpper
        }
    }
}

// Change all calls of "new DataFixerBuilder()" to "new LazyDataFixerBuilder()"
function createFixerUpper(method) {
    var i;
    for (i = 0; i < method.instructions.size(); i++) {
        var insn = method.instructions.get(i)

        if (insn.getOpcode() == Opcodes.NEW && insn.desc.equals('com/mojang/datafixers/DataFixerBuilder')) {
            insn.desc = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
        }

        if (insn.getOpcode() == Opcodes.INVOKESPECIAL && insn.owner.equals('com/mojang/datafixers/DataFixerBuilder') && insn.name.equals('<init>')) {
            insn.owner = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
        }
    }

    // finish up
    return method;
}
