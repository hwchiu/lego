import CompanyRankingTable from './CompanyRankingTable';
import NewsGeoMap from './NewsGeoMap';

export default function NewsInsights() {
  return (
    <div className="news-insights-segment">
      <CompanyRankingTable />
      <NewsGeoMap />
    </div>
  );
}
