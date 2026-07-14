'use client';

import SolutionManager from '../../components/SolutionManager';
import { appWebsiteStore, useAppWebsiteCards } from '../../utils/solutionCardsStore';

export default function AppWebsitesDashboardPage() {
  const [cards] = useAppWebsiteCards();
  return <SolutionManager title="App & Website" eyebrow="PUBLIC SOLUTIONS / DIGITAL PRODUCTS" description="Manage the application and website services shown to visitors on the public Solutions page." cards={cards} onAdd={appWebsiteStore.add} onUpdate={appWebsiteStore.update} onDelete={appWebsiteStore.remove} />;
}
