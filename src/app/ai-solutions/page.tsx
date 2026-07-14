'use client';

import SolutionManager from '../../components/SolutionManager';
import { aiSolutionStore, useAiSolutionCards } from '../../utils/solutionCardsStore';

export default function AiSolutionsDashboardPage() {
  const [cards] = useAiSolutionCards();
  return <SolutionManager title="AI Solutions" eyebrow="PUBLIC SOLUTIONS / INTELLIGENCE" description="Manage the AI agents, knowledge systems, and automation solutions shown to visitors." cards={cards} onAdd={aiSolutionStore.add} onUpdate={aiSolutionStore.update} onDelete={aiSolutionStore.remove} />;
}
