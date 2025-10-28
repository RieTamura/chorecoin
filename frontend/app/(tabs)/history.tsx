import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import apiService from '../../services/api';
import { HistoryItem } from '../../types';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const historyData = await apiService.getHistory();
      setHistory(historyData);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  };

  const groupByDate = (items: HistoryItem[]) => {
    const groups: { [key: string]: HistoryItem[] } = {};
    items.forEach((item) => {
      const date = new Date(item.created_at).toLocaleDateString('ja-JP');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return groups;
  };

  const groupedHistory = groupByDate(history);
  const dates = Object.keys(groupedHistory).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dates}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item: date }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedHistory[date].map((historyItem) => (
              <View
                key={historyItem.id}
                style={[
                  styles.historyCard,
                  historyItem.type === 'earn'
                    ? styles.earnCard
                    : styles.claimCard,
                ]}
              >
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{historyItem.name}</Text>
                  <Text style={styles.historyTime}>
                    {formatDate(historyItem.created_at)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyPoints,
                    historyItem.type === 'earn'
                      ? styles.earnPoints
                      : styles.claimPoints,
                  ]}
                >
                  {historyItem.type === 'earn' ? '+' : '-'}
                  {historyItem.points}pt
                </Text>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            履歴がありません。{'\n'}
            お手伝いを完了するとここに表示されます。
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
  list: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    paddingLeft: 4,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  earnCard: {
    borderLeftColor: '#4CAF50',
  },
  claimCard: {
    borderLeftColor: '#FF9800',
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  earnPoints: {
    color: '#4CAF50',
  },
  claimPoints: {
    color: '#FF9800',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 14,
    lineHeight: 20,
  },
});
