package me.steinborn.lazydfu;

import net.minecraft.util.datafix.DataFixesManager;
import net.minecraftforge.fml.*;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.Marker;
import org.apache.logging.log4j.MarkerManager;

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
    private static final Logger LOGGER = LogManager.getLogger("LazyDFU");

    public static boolean isUsingLazyBuilder = false;

    public LazyDFU()
    {
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::commonSetup);
    }

    private void commonSetup(final FMLCommonSetupEvent event)
    {
        Marker marker = MarkerManager.getMarker("INIT");

        boolean coreModStatus = false;
        try
        {
            coreModStatus = (boolean) DataFixesManager.class.getField("lazydfu_status").get(false);
        }
        catch (NoSuchFieldException | IllegalAccessException ignored)
        {
        }

        if (!coreModStatus || !isUsingLazyBuilder)
        {
            // Exception message is hard-coded in English just in case.
            ConcurrentModificationException e = new ConcurrentModificationException("LazyDFU detected that another mod is modifying/killing the DataFixerUpper!");

            // Add a warning to the FML warnings GUI screen
            ModLoader.get().addWarning(new ModLoadingWarning(
                    ModList.get().getModContainerById(LazyDFU.MOD_ID).get().getModInfo(),
                    ModLoadingStage.COMMON_SETUP,
                    "lazydfu.gui.message",
                    e.getMessage(), e.getClass().getSimpleName()
            ));

            // Explain what happened in the console
            LOGGER.fatal(marker, "LazyDFU did not initialize successfully.");
            LOGGER.fatal(marker, "This is most likely because you have another mod installed that is killing or modifying the DataFixerUpper.");
            LOGGER.fatal(marker, "Please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches's data fixer disabler.");
            LOGGER.fatal(marker, "If you believe you got this message in error, please send an issue to the issue tracker.");
            LOGGER.fatal(marker, "https://github.com/Jonathing/lazydfu/issues", e);
        }
        else
        {
            LOGGER.info(marker, "LazyDFU was initialized successfully.");
        }
    }
}
