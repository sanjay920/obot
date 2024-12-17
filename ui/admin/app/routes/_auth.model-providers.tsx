import useSWR, { preload } from "swr";

import { ModelProvider } from "~/lib/model/modelProviders";
import { DefaultModelAliasApiService } from "~/lib/service/api/defaultModelAliasApiService";
import { ModelApiService } from "~/lib/service/api/modelApiService";
import { ModelProviderApiService } from "~/lib/service/api/modelProviderApiService";
import { RouteHandle } from "~/lib/service/routeHandles";

import { TypographyH2 } from "~/components/Typography";
import { WarningAlert } from "~/components/composed/WarningAlert";
import { ModelProviderList } from "~/components/model-providers/ModelProviderLists";
import { CommonModelProviderIds } from "~/components/model-providers/constants";
import { DefaultModelAliasFormDialog } from "~/components/model/DefaultModelAliasForm";

export async function clientLoader() {
    await Promise.all([
        preload(ModelApiService.getModels.key(), ModelApiService.getModels),
        preload(
            ModelProviderApiService.getModelProviders.key(),
            ModelProviderApiService.getModelProviders
        ),
        preload(
            DefaultModelAliasApiService.getAliases.key(),
            DefaultModelAliasApiService.getAliases
        ),
    ]);
    return null;
}

const sortModelProviders = (modelProviders: ModelProvider[]) => {
    return [...modelProviders].sort((a, b) => {
        const preferredOrder = [
            CommonModelProviderIds.OPENAI,
            CommonModelProviderIds.AZURE_OPENAI,
            CommonModelProviderIds.ANTHROPIC,
            CommonModelProviderIds.OLLAMA,
            CommonModelProviderIds.RUBRA,
            CommonModelProviderIds.VOYAGE,
        ];
        const aIndex = preferredOrder.indexOf(a.id);
        const bIndex = preferredOrder.indexOf(b.id);

        // If both providers are in preferredOrder, sort by their order
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // If only a is in preferredOrder, it comes first
        if (aIndex !== -1) return -1;
        // If only b is in preferredOrder, it comes first
        if (bIndex !== -1) return 1;

        // For all other providers, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });
};

export default function ModelProviders() {
    const getModelProviders = useSWR(
        ModelProviderApiService.getModelProviders.key(),
        ModelProviderApiService.getModelProviders
    );

    const configured = getModelProviders.data?.some(
        (provider) => provider.configured
    );
    const modelProviders = sortModelProviders(getModelProviders.data ?? []);
    return (
        <div>
            <div className="relative space-y-10 px-8 pb-8">
                <div className="sticky top-0 bg-background pt-8 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <TypographyH2 className="mb-0 pb-0">
                            Model Providers
                        </TypographyH2>
                        <DefaultModelAliasFormDialog disabled={!configured} />
                    </div>
                    {configured ? null : (
                        <WarningAlert
                            title="No Model Providers Configured!"
                            description="To use Acorn's features, you'll need to
                                set up a Model Provider. Select and configure
                                one below to get started!"
                        />
                    )}
                </div>

                <div className="h-full flex flex-col gap-8 overflow-hidden">
                    <ModelProviderList modelProviders={modelProviders ?? []} />
                </div>
            </div>
        </div>
    );
}

export const handle: RouteHandle = {
    breadcrumb: () => [{ content: "Model Providers" }],
};
