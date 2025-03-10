// class imports
var ASMAPI = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var Opcodes = Java.type('org.objectweb.asm.Opcodes')
var FieldNode = Java.type('org.objectweb.asm.tree.FieldNode')

/**
 * The DataFixers coremod hooks into the DataFixers class and injects the ASM bytecode presented in the transformers
 * returned by this method.
 *
 * @returns {{createFixerUpper: {transformer: (function(*=): *), target: {name: string, type: string}}}}
 */
function initializeCoreMod() {
    return {
        'createFixerUpper': {
            'target': {
                'type': 'CLASS',
                'name': 'net.minecraft.util.datafix.DataFixers'
            },
            'transformer': createFixerUpper
        }
    }
}

/**
 * This function mainly transforms the createFixerUpper() method in the given class to change all calls of "new
 * DataFixerBuilder()" to "new LazyDataFixerBuilder()". This way, the lazy data fixer is used rather than the original
 * one when it is attempted to be created. In addition, a new field is created in the class which states whether or not
 * the transformation was successful.
 *
 * @param clazz The DataFixers class's bytecode that will be transformed by this coremod.
 * @returns {*} The transformed class.
 */
function createFixerUpper(clazz) {
    // Get the MethodNode we're trying to inject into.
    var method = getMethod(clazz, ASMAPI.mapMethod("m_14529_"))

    // Simple count variables for our for loop.
    var i
    var newCount = 0
    var invokeCount = 0

    // Start reading from the head of the MethodNode.
    for (i = 0; i < method.instructions.size(); i++)
    {
        var insn = method.instructions.get(i)

        // Replace any creations of DataFixerBuilder with LazyDataFixerBuilder.
        if (insn.getOpcode() == Opcodes.NEW && insn.desc.equals('com/mojang/datafixers/DataFixerBuilder'))
        {
            insn.desc = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            newCount++
        }

        // Replace any invocations of "new DataFixerBuilder()" with "new LazyDataFixerBuilder()".
        if (insn.getOpcode() == Opcodes.INVOKESPECIAL && insn.owner.equals('com/mojang/datafixers/DataFixerBuilder') && insn.name.equals('<init>'))
        {
            insn.owner = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            invokeCount++
        }
    }

    // Check if anything might've gone wrong early on.
    if (newCount == 1 && invokeCount == 1)
        clazz.fields.add(new FieldNode(Opcodes.ACC_PUBLIC + Opcodes.ACC_STATIC + Opcodes.ACC_FINAL, 'lazydfu_status', 'Z', null, true))
    else
        clazz.fields.add(new FieldNode(Opcodes.ACC_PUBLIC + Opcodes.ACC_STATIC + Opcodes.ACC_FINAL, 'lazydfu_status', 'Z', null, false))

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
function getMethod(clazz, name)
{
    for (var index in clazz.methods)
    {
        var method = clazz.methods[index]
        if (method.name.equals(name))
        {
            return method
        }
    }

    throw "DataFixersCoreMod couldn't find method with name '" + name + "' in '" + clazz.name + "'!"
}
