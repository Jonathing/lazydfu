package me.steinborn.lazydfu.mod;

import com.mojang.datafixers.DataFixer;
import com.mojang.datafixers.DataFixerBuilder;
import me.steinborn.lazydfu.LazyDFU;

import java.util.concurrent.Executor;

/**
 * This version of {@link DataFixerBuilder} does not immediately initialize rules.
 *
 * @author tuxed
 * @author Jonathing
 * @since 0.1.0
 */
@SuppressWarnings("unused")
public class LazyDataFixerBuilder extends DataFixerBuilder
{
    //@formatter:off
    private static final Executor NO_OP_EXECUTOR = command -> {};
    //@formatter:on

    /**
     * This constructor method initializes the lazy data fixer with the given data version.
     *
     * @param dataVersion The data version (usually representative of the Minecraft version) for the DFU to use.
     */
    public LazyDataFixerBuilder(int dataVersion)
    {
        super(dataVersion);
    }

    @Override
    public DataFixer build(Executor executor)
    {
        LazyDFU.isUsingLazyBuilder = true;
        return super.build(NO_OP_EXECUTOR);
    }
}
