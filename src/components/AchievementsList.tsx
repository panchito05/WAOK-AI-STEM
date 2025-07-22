'use client';

import { Award, Lock, Star, TrendingUp, Zap, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Achievement } from '@/lib/practice-history';

interface AchievementsListProps {
  achievements: Achievement[];
}

// All possible achievements
const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    name: '¡Primera Sesión!',
    description: 'Completaste tu primera sesión de práctica',
    icon: '🌟',
    type: 'milestone',
  },
  {
    id: 'perfect-session',
    name: 'Sesión Perfecta',
    description: 'Respondiste todo correctamente en una sesión',
    icon: '💯',
    type: 'accuracy',
  },
  {
    id: 'speed-demon',
    name: 'Rayo Veloz',
    description: 'Completaste 10 ejercicios con menos de 5 segundos por problema',
    icon: '⚡',
    type: 'speed',
  },
  {
    id: 'week-streak',
    name: 'Semana Completa',
    description: 'Practicaste 7 días seguidos',
    icon: '🔥',
    type: 'streak',
  },
  {
    id: '100-problems',
    name: 'Centenario',
    description: 'Resolviste 100 problemas en total',
    icon: '🎯',
    type: 'milestone',
  },
  {
    id: '500-problems',
    name: 'Medio Millar',
    description: 'Resolviste 500 problemas en total',
    icon: '🏆',
    type: 'milestone',
    target: 500,
  },
  {
    id: '1000-problems',
    name: 'Matemático Experto',
    description: 'Resolviste 1000 problemas en total',
    icon: '👑',
    type: 'milestone',
    target: 1000,
  },
  {
    id: 'month-streak',
    name: 'Mes Completo',
    description: 'Practicaste 30 días seguidos',
    icon: '🌈',
    type: 'streak',
    target: 30,
  },
  {
    id: 'accuracy-master',
    name: 'Maestro de la Precisión',
    description: 'Mantén 95% de precisión en 10 sesiones seguidas',
    icon: '🎯',
    type: 'accuracy',
    target: 10,
  },
  {
    id: 'early-bird',
    name: 'Madrugador',
    description: 'Completa 10 sesiones antes de las 9 AM',
    icon: '🌅',
    type: 'special',
    target: 10,
  },
  {
    id: 'night-owl',
    name: 'Búho Nocturno',
    description: 'Completa 10 sesiones después de las 8 PM',
    icon: '🦉',
    type: 'special',
    target: 10,
  },
  {
    id: 'all-operations',
    name: 'Matemático Completo',
    description: 'Practica todas las operaciones (suma, resta, multiplicación, división)',
    icon: '🧮',
    type: 'special',
  },
];

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'milestone':
      return <Target className="h-5 w-5" />;
    case 'streak':
      return <Flame className="h-5 w-5" />;
    case 'speed':
      return <Zap className="h-5 w-5" />;
    case 'accuracy':
      return <TrendingUp className="h-5 w-5" />;
    case 'special':
      return <Star className="h-5 w-5" />;
    default:
      return <Award className="h-5 w-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'milestone':
      return 'text-blue-600 bg-blue-100';
    case 'streak':
      return 'text-orange-600 bg-orange-100';
    case 'speed':
      return 'text-yellow-600 bg-yellow-100';
    case 'accuracy':
      return 'text-green-600 bg-green-100';
    case 'special':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export default function AchievementsList({ achievements }: AchievementsListProps) {
  const unlockedIds = achievements.map(a => a.id);
  
  // Separate unlocked and locked achievements
  const unlockedAchievements = achievements;
  const lockedAchievements = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resumen de Logros
            </span>
            <span className="text-2xl font-bold text-primary">
              {achievements.length} / {ALL_ACHIEVEMENTS.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(achievements.length / ALL_ACHIEVEMENTS.length) * 100} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {((achievements.length / ALL_ACHIEVEMENTS.length) * 100).toFixed(0)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Logros Desbloqueados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {achievement.name}
                        <div className={`p-1 rounded-full ${getTypeColor(achievement.type)}`}>
                          {getAchievementIcon(achievement.type)}
                        </div>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Desbloqueado el {new Date(achievement.unlockedAt!).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Logros por Desbloquear
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl grayscale opacity-50">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {achievement.name}
                        <div className={`p-1 rounded-full ${getTypeColor(achievement.type)} opacity-50`}>
                          {getAchievementIcon(achievement.type)}
                        </div>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                {achievement.target && achievement.progress !== undefined && (
                  <CardContent className="pt-0">
                    <Progress 
                      value={(achievement.progress / achievement.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.progress} / {achievement.target}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {achievements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              ¡Comienza a practicar para desbloquear logros increíbles!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}