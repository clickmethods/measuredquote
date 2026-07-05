import { getTradeConfig } from '@/data/tradeConfigs';
import { useLanguage } from '@/hooks/useLanguage';
import TradeEstimatorPage from '@/components/estimator/TradeEstimatorPage';

const trade = getTradeConfig('temp-fence')!;

export default function TempFenceEstimator() {
  const lang = useLanguage();
  return <TradeEstimatorPage trade={trade} lang={lang} />;
}
