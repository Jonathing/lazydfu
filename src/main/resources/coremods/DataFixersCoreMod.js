// class imports
var ASMAPI = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var Opcodes = Java.type('org.objectweb.asm.Opcodes')

/**
 * The DataFixersCoreMod coremod hooks into the DataFixesManager class and injects the ASM bytecode presented in the
 * transformers returned by this method.
 *
 * @returns {{createFixer: {transformer: (function(*=): *), target: {type: string, name: string}}}}
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
    // Get the MethodNode we're trying to inject into.
    var method = getMethod(clazz, ASMAPI.mapMethod("func_188279_a"))

    // Simple count variables for our for loop.
    var i
    var newCount = 0
    var invokeCount = 0

    // Start reading from the head of the MethodNode.
    for (i = 0; i < method.instructions.size(); i++) {
        var insn = method.instructions.get(i)

        // Replace any creations of DataFixerBuilder with LazyDataFixerBuilder.
        if (insn.getOpcode() == Opcodes.NEW && insn.desc.equals('com/mojang/datafixers/DataFixerBuilder')) {
            insn.desc = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            newCount++
        }

        // Replace any invocations of "new DataFixerBuilder()" with "new LazyDataFixerBuilder()".
        if (insn.getOpcode() == Opcodes.INVOKESPECIAL && insn.owner.equals('com/mojang/datafixers/DataFixerBuilder') && insn.name.equals('<init>')) {
            insn.owner = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            invokeCount++
        }
    }

    // Check if anything might've gone wrong early on.
    if (newCount == 1 && invokeCount == 1) {
        log('INFO', '[LazyDFU] LazyDFU was initialized successfully.')
    } else if (newCount == 0 || invokeCount == 0) {
        log('FATAL', '[LazyDFU] LazyDFU seems to have been initialized successfully, but something seems off.')
        log('FATAL', '[LazyDFU] Any variable trying to create a normal DataFixerBuilder did not exist at the time of method transformation.')
        log('FATAL', '[LazyDFU] This usually means another mod is trying to kill or modify the data fixer initialization system.')
        log('FATAL', '[LazyDFU] Please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    } else {
        log('FATAL', '[LazyDFU] LazyDFU seems to have been initialized successfully, but something seems off.')
        log('FATAL', '[LazyDFU] It seems like more than one DataFixerBuilder was transformed in the method, which should be impossible.')
        log('FATAL', '[LazyDFU] In any case, please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    }

    return clazz
}

/**
 * This function attempts to get the MethodNode specified by the given name in the given ClassNode. If no applicable
 * MethodNode was found, an error will be thrown declaring so.
 *
 * @param clazz The ClassNode to get the MethodNode from.
 * @param name  The name of the method to get the MethodNode for.
 * @returns {*} The MethodNode that was found in the ClassNode.
 */
function getMethod(clazz, name) {
    for (var index in clazz.methods) {
        var method = clazz.methods[index]
        if (method.name.equals(name)) {
            return method
        }
    }

    throw "LazyDFU couldn't find method with name '" + name + "' in '" + clazz.name + "'!"
}

/**
 * This function logs a message to console. If the ASMAPI.log function exists at runtime, it will use that method. If
 * not, it will use the standard print() method.
 *
 * @param level   The logging level to log to.
 * @param message The message to log to the console.
 */
function log(level, message) {
    try {
        ASMAPI.log(level, message)
    } catch (error) {
        print(message)
    }
}
