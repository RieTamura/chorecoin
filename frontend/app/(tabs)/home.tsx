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
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Chore, PointsSummary } from '../../types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [points, setPoints] = useState<PointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [choresData, pointsData] = await Promise.all([
        apiService.getChores(),
        apiService.getPoints(),
      ]);
      setChores(choresData);
      setPoints(pointsData);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteChore = async (chore: Chore) => {
    try {
      const result = await apiService.completeChore(chore.id);
      Alert.alert(
        '完了！',
        `${chore.name}を完了しました！\n+${result.pointsEarned}ポイント獲得 🎉`
      );
      await loadData();
    } catch (error) {
      Alert.alert('エラー', 'お手伝いの完了に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      {/* Points Display */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>現在のポイント</Text>
        <Text style={styles.pointsValue}>{points?.totalPoints || 0}</Text>
        <Text style={styles.pointsSubtext}>コイン 🪙</Text>
      </View>

      {/* Chores List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>やることリスト</Text>
        <FlatList
          data={chores}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} />
          }
          renderItem={({ item }) => (
            <View style={styles.choreCard}>
              <View style={styles.choreInfo}>
                <Text style={styles.choreName}>{item.name}</Text>
                <Text style={styles.chorePoints}>+{item.points}pt</Text>
                {item.recurring === 1 && (
                  <Text style={styles.choreRecurring}>毎日</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteChore(item)}
              >
                <Text style={styles.completeButtonText}>完了</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              お手伝いがありません。{'\n'}
              管理画面から追加してください。
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pointsCard: {
    backgroundColor: '#4CAF50',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  pointsSubtext: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  choreCard: {
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
  choreInfo: {
    flex: 1,
  },
  choreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chorePoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  choreRecurring: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  completeButtonText: {
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
