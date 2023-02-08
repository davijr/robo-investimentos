import { DomsAccrualBasis } from "../doms/DomsAccrualBasis";
import { DomsCcyConvType } from "../doms/DomsCcyConvType";
import { DomsSystemType } from "../doms/DomsSystemType";
import { SysCurrency } from "../sys/SysCurrency";
import { SysCurve } from "../sys/SysCurve";
import { SysCurveUnderlyingLink } from "../sys/SysCurveUnderlyingLink";
import { SysExternalSystem } from "../sys/SysExternalSystem";
import { SysUnderlying } from "../sys/SysUnderlying";
import { SysUnderlyingType } from "../sys/SysUnderlyingType";
import { Model } from "../Model";

export function getModelInstance(modelName: string): Model | undefined {
    switch (modelName) {
        // dom
        case 'DomsSystemType': return new DomsSystemType(); break;
        case 'DomsAccrualBasis': return new DomsAccrualBasis(); break;
        case 'DomsCcyConvType': return new DomsCcyConvType(); break;
        // sys
        case 'SysExternalSystem': return new SysExternalSystem(); break;
        case 'SysCurrency': return new SysCurrency(); break;
        case 'SysCurve': return new SysCurve(); break;
        case 'SysCurveUnderlyingLink': return new SysCurveUnderlyingLink(); break;
        case 'SysUnderlying': return new SysUnderlying(); break;
        case 'SysUnderlyingType': return new SysUnderlyingType(); break;
        default: return undefined;
    }
}