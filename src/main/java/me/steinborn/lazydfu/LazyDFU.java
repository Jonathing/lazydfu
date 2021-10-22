package me.steinborn.lazydfu;

import net.minecraftforge.fml.*;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.minecraftforge.forgespi.language.IModInfo;

import java.util.ConcurrentModificationException;

/**
 * This is the main class of the LazyDFU mod and it does... well... nothing! It merely exists as a placeholder so that
 * Forge is able to detect our JAR file and can then load our coremod into the game.
 *
 * @author Jonathing
 * @author CorgiTaco
 * @see me.steinborn.lazydfu.mod.LazyDataFixerBuilder
 * @since 0.1.3
 */
@Mod(LazyDFU.MOD_ID)
public class LazyDFU
{
    public static final String MOD_ID = "lazydfu";

    public static boolean isUsingLazyBuilder = false;

    public LazyDFU()
    {
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::commonSetup);
    }

    private void commonSetup(final FMLCommonSetupEvent event)
    {
        if (!isUsingLazyBuilder)
        {
            IModInfo modInfo =  ModList.get().getModContainerById(LazyDFU.MOD_ID).get().getModInfo();

            ConcurrentModificationException e = new ConcurrentModificationException(ForgeI18n.parseMessage("lazydfu.warning.exception"));

            ModLoadingWarning warning = new ModLoadingWarning(
                    modInfo, ModLoadingStage.COMMON_SETUP, "lazydfu.warning.message",
                    e.getMessage(),
                    e.getClass().getSimpleName()
            );

            ModLoader.get().addWarning(warning);
        }
    }
}
