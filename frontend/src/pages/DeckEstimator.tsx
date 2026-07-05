import { getTradeConfig } from '@/data/tradeConfigs';
import { useLanguage } from '@/hooks/useLanguage';
import TradeEstimatorPage from '@/components/estimator/TradeEstimatorPage';

const trade = getTradeConfig('decks')!;

export default function DeckEstimator() {
  const lang = useLanguage();
  return <TradeEstimatorPage trade={trade} lang={lang} />;
}
