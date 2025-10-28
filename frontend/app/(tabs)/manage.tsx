import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Chore, Reward } from '../../types';

export default function ManageScreen() {
  const { user, logout } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showChoreModal, setShowChoreModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  
  // Form states
  const [choreName, setChoreName] = useState('');
  const [chorePoints, setChorePoints] = useState('');
  const [choreRecurring, setChoreRecurring] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [choresData, rewardsData] = await Promise.all([
        apiService.getChores(),
        apiService.getRewards(),
      ]);
      setChores(choresData);
      setRewards(rewardsData);
    } catch (error) {
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    }
  };

  const handleAddChore = async () => {
    if (!choreName || !chorePoints) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    try {
      await apiService.createChore(choreName, parseInt(chorePoints), choreRecurring);
      Alert.alert('成功', 'お手伝いを追加しました');
      setChoreName('');
      setChorePoints('');
      setChoreRecurring(false);
      setShowChoreModal(false);
      await loadData();
    } catch (error) {
      Alert.alert('エラー', 'お手伝いの追加に失敗しました');
    }
  };

  const handleDeleteChore = async (id: string) => {
    Alert.alert('削除確認', 'このお手伝いを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteChore(id);
            await loadData();
          } catch (error) {
            Alert.alert('エラー', 'お手伝いの削除に失敗しました');
          }
        },
      },
    ]);
  };

  const handleAddReward = async () => {
    if (!rewardName || !rewardPoints) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    try {
      await apiService.createReward(rewardName, parseInt(rewardPoints));
      Alert.alert('成功', 'ご褒美を追加しました');
      setRewardName('');
      setRewardPoints('');
      setShowRewardModal(false);
      await loadData();
    } catch (error) {
      Alert.alert('エラー', 'ご褒美の追加に失敗しました');
    }
  };

  const handleDeleteReward = async (id: string) => {
    Alert.alert('削除確認', 'このご褒美を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteReward(id);
            await loadData();
          } catch (error) {
            Alert.alert('エラー', 'ご褒美の削除に失敗しました');
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userCard}>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* Chores Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>お手伝い管理</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowChoreModal(true)}
          >
            <Text style={styles.addButtonText}>+ 追加</Text>
          </TouchableOpacity>
        </View>
        {chores.map((chore) => (
          <View key={chore.id} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{chore.name}</Text>
              <Text style={styles.itemPoints}>{chore.points}pt</Text>
              {chore.recurring === 1 && (
                <Text style={styles.itemRecurring}>毎日</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleDeleteChore(chore.id)}>
              <Text style={styles.deleteText}>削除</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Rewards Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ご褒美管理</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRewardModal(true)}
          >
            <Text style={styles.addButtonText}>+ 追加</Text>
          </TouchableOpacity>
        </View>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{reward.name}</Text>
              <Text style={styles.itemPoints}>{reward.points}pt</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteReward(reward.id)}>
              <Text style={styles.deleteText}>削除</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Chore Modal */}
      <Modal visible={showChoreModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>お手伝いを追加</Text>
            <TextInput
              style={styles.input}
              placeholder="お手伝いの名前"
              value={choreName}
              onChangeText={setChoreName}
            />
            <TextInput
              style={styles.input}
              placeholder="ポイント"
              value={chorePoints}
              onChangeText={setChorePoints}
              keyboardType="number-pad"
            />
            <View style={styles.switchRow}>
              <Text>毎日繰り返す</Text>
              <Switch value={choreRecurring} onValueChange={setChoreRecurring} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChoreModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddChore}
              >
                <Text style={styles.saveButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reward Modal */}
      <Modal visible={showRewardModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ご褒美を追加</Text>
            <TextInput
              style={styles.input}
              placeholder="ご褒美の名前"
              value={rewardName}
              onChangeText={setRewardName}
            />
            <TextInput
              style={styles.input}
              placeholder="必要ポイント"
              value={rewardPoints}
              onChangeText={setRewardPoints}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRewardModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddReward}
              >
                <Text style={styles.saveButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPoints: {
    fontSize: 14,
    color: '#4CAF50',
  },
  itemRecurring: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
