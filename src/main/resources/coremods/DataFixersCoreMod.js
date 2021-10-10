// class imports
var ASMAPI = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var Opcodes = Java.type('org.objectweb.asm.Opcodes')

/**
 * The DataFixersCoreMod coremod hooks into the DataFixesManager class and injects the ASM bytecode presented in the
 * transformers returned by this method.
 *
 * @returns {{createFixer: {transformer: (function(*=): *), target: {type: string, class: string}}}}
 */
function initializeCoreMod() {
    return {
        'createFixer': {
            'target': {
                'type': 'CLASS',
                'name': 'net.minecraft.util.datafix.DataFixesManager'
            },
            'transformer': createFixer
        }
    }
}

/**
 * This function transforms the createFixer() method in the given class to change all calls of "new DataFixerBuilder()"
 * to "new LazyDataFixerBuilder()". This way, the lazy data fixer is used rather than the original one when it is
 * attempted to be created.
 *
 * @param clazz The DataFixesManager class's bytecode that will be transformed by this coremod.
 * @returns {*} The transformed class.
 */
function createFixer(clazz) {
    var method = getMethod(clazz, ASMAPI.mapMethod("func_188279_a"))

    var i
    var newCount = 0
    var invokeCount = 0

    for (i = 0; i < method.instructions.size(); i++) {
        var insn = method.instructions.get(i)

        if (insn.getOpcode() == Opcodes.NEW && insn.desc.equals('com/mojang/datafixers/DataFixerBuilder')) {
            insn.desc = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            newCount++
        }

        if (insn.getOpcode() == Opcodes.INVOKESPECIAL && insn.owner.equals('com/mojang/datafixers/DataFixerBuilder') && insn.name.equals('<init>')) {
            insn.owner = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            invokeCount++
        }
    }

    // finish up
    if (newCount == 1 && invokeCount == 1) {
        print('[LazyDFU] LazyDFU was initialized successfully.')
    } else if (newCount == 0 || invokeCount == 0) {
        print('[LazyDFU] LazyDFU seems to have been initialized successfully, but something seems off.')
        print('[LazyDFU] Any variable trying to create a normal DataFixerBuilder did not exist at the time of method transformation.')
        print('[LazyDFU] This usually means another mod is trying to kill or modify the data fixer initialization system.')
        print('[LazyDFU] Please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    } else {
        print('[LazyDFU] LazyDFU seems to have been initialized successfully, but something seems off.')
        print('[LazyDFU] It seems like more than one DataFixerBuilder was transformed in the method, which should be impossible.')
        print('[LazyDFU] In any case, please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    }

    return clazz
}

function getMethod(clazz, name) {
    for (var index in clazz.methods) {
        var method = clazz.methods[index]
        if (method.name.equals(name)) {
            return method
        }
    }

    throw "[LazyDFU] Couldn't find method with name '" + name + "' in '" + clazz.name + "'!"
}
