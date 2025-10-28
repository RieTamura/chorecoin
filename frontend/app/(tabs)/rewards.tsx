import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import apiService from '../../services/api';
import { Reward, PointsSummary } from '../../types';

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState<PointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rewardsData, pointsData] = await Promise.all([
        apiService.getRewards(),
        apiService.getPoints(),
      ]);
      setRewards(rewardsData);
      setPoints(pointsData);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (reward: Reward) => {
    if (!points || points.totalPoints < reward.points) {
      Alert.alert(
        'ポイント不足',
        `このご褒美には${reward.points}ポイント必要です。\n現在のポイント: ${points?.totalPoints || 0}`
      );
      return;
    }

    Alert.alert(
      'ご褒美を交換',
      `${reward.name}を交換しますか？\n${reward.points}ポイント消費します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '交換する',
          onPress: async () => {
            try {
              await apiService.claimReward(reward.id);
              Alert.alert('成功！', `${reward.name}と交換しました！🎉`);
              await loadData();
            } catch (error) {
              Alert.alert('エラー', 'ご褒美の交換に失敗しました');
            }
          },
        },
      ]
    );
  };

  const canAfford = (rewardPoints: number) => {
    return points && points.totalPoints >= rewardPoints;
  };

  return (
    <View style={styles.container}>
      {/* Points Display */}
      <View style={styles.pointsHeader}>
        <Text style={styles.pointsText}>
          現在のポイント: {points?.totalPoints || 0} 🪙
        </Text>
      </View>

      {/* Rewards List */}
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const affordable = canAfford(item.points);
          return (
            <View style={[styles.rewardCard, !affordable && styles.rewardCardDisabled]}>
              <View style={styles.rewardInfo}>
                <Text style={[styles.rewardName, !affordable && styles.textDisabled]}>
                  {item.name}
                </Text>
                <Text style={[styles.rewardPoints, !affordable && styles.textDisabled]}>
                  {item.points}pt
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.claimButton, !affordable && styles.claimButtonDisabled]}
                onPress={() => handleClaimReward(item)}
                disabled={!affordable}
              >
                <Text style={styles.claimButtonText}>
                  {affordable ? '交換' : '🔒'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            ご褒美がありません。{'\n'}
            管理画面から追加してください。
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pointsHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  rewardCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardCardDisabled: {
    opacity: 0.5,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  textDisabled: {
    color: '#999',
  },
  claimButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  claimButtonDisabled: {
    backgroundColor: '#ccc',
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 14,
    lineHeight: 20,
  },
});
