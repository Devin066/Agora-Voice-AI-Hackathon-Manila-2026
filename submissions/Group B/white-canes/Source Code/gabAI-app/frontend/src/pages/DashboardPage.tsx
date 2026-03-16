import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/shared/StatCard';
import TopicCard from '@/components/dashboard/TopicCard';
import AreaToReviewRow from '@/components/dashboard/AreaToReviewRow';
import { Clock, Trophy, BookOpen, GraduationCap, Mic2, Dna, Globe, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Welcome back! Ready to master some new topics?</p>
        </div>
        <button
          onClick={() => navigate('/session')}
          className="bg-gradient-to-br from-[#1f0b47] to-[#2e1065] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#1f0b47]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Mic2 size={18} />
          Start Voice Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          label="Study Time"
          value="7h 45m"
          subtext="This week"
          delta="+12%"
          deltaType="positive"
          icon={<Clock size={20} />}
        />
        <StatCard
          label="Avg. Score"
          value="88%"
          subtext="From quizzes"
          delta="+5%"
          deltaType="positive"
          icon={<Trophy size={20} />}
        />
        <StatCard
          label="Topics"
          value="12"
          subtext="In progress"
          icon={<BookOpen size={20} />}
        />
        <StatCard
          label="Mastery"
          value="4"
          subtext="Topics completed"
          delta="+1"
          deltaType="positive"
          icon={<GraduationCap size={20} />}
        />
      </div>

      {/* Two-column layout for topics and review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Topics Section — spans 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopicCard
              icon={<Dna size={22} />}
              title="Introduction to Biology"
              description="Cell structure, functions, and the basics of genetics."
              questionCount={45}
              proficiency={75}
            />
            <TopicCard
              icon={<Globe size={22} />}
              title="World History"
              description="The impact of the industrial revolution on modern society."
              questionCount={32}
              proficiency={45}
            />
            <TopicCard
              icon={<TrendingUp size={22} />}
              title="Calculus I"
              description="Derivatives, integrals, and their real-world applications."
              questionCount={58}
              proficiency={20}
            />
          </div>
        </div>

        {/* Areas to Review — spans 1 column */}
        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">Areas to Review</h2>
          <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
            <AreaToReviewRow topic="Cell Mitosis" category="Biology" proficiency={28} />
            <AreaToReviewRow topic="World War II" category="History" proficiency={35} />
            <AreaToReviewRow topic="Integration" category="Calculus I" proficiency={18} />
            <AreaToReviewRow topic="Chain Rule" category="Calculus I" proficiency={42} />
            <AreaToReviewRow topic="DNA Replication" category="Biology" proficiency={55} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
