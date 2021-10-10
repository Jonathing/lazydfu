package me.steinborn.lazydfu.mod;

import com.mojang.datafixers.*;

import java.util.concurrent.Executor;

/**
 * This version of {@code DataFixerBuilder} does not immediately initialize rules.
 *
 * @author tuxed
 * @since 0.1.0
 */
@SuppressWarnings("unused")
public class LazyDataFixerBuilder extends DataFixerBuilder
{
    private static final Executor NO_OP_EXECUTOR = command -> {};

    /**
     * This constructor method initializes the lazy data fixer with the given data version.
     *
     * @param dataVersion The data version (usually representative of the Minecraft version) for the DFU to use.
     */
    public LazyDataFixerBuilder(int dataVersion) {
        super(dataVersion);
    }

    @Override
    public DataFixer build(Executor executor) {
        return super.build(NO_OP_EXECUTOR);
    }
}
