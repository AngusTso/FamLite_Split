import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Image,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export default function GroupSelectionScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const { token, user, logout } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `http://192.168.50.68:3000/users/${user._id}/groups`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        const groupData = await res.json();
        setGroups(groupData);
        if (groups.length > 0) {
          setSelectedGroup(groups[0]);
        }
      } catch (e) {
        console.error("Can't get groups", e);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const fetchMember = async () => {
        try {
          const res = await fetch(
            `http://192.168.50.68:3000/groups/${selectedGroup._id}/members`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );
          const membersData = await res.json();
          setMembers(membersData);
        } catch (e) {
          console.error("Can't fetch members", e);
        }
      };
      fetchMember();
    }
  }, [selectedGroup]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleCreateGroup = () => {
    //Create Group
    setModalVisible(true);
  };

  const handleJoinGroup = () => {
    setJoinModalVisible(true);
  };

  const handleCreateGroupSubmit = async () => {
    console.log("Creating group with name:", newGroupName, "Token:", token);
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter group name");
      return;
    }

    try {
      const res = await fetch("http://192.168.50.68:3000/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
        }),
      });

      if (!res.ok) {
        console.log(res);
        throw new Error("Create Group Failed");
      }

      const newGroup = await res.json();
      setGroups([...groups, newGroup]);
      setSelectedGroup(newGroup);
      setNewGroupName("");
      setModalVisible(false);
      Alert.alert("Success", "Group created");
    } catch (e) {
      console.error("Create Group Failed", e);
      Alert.alert("Failed", "Can't create group , please try again");
    }
  };

  const handleJoinGroupSubmit = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter invite code");
      return;
    }

    try {
      const res = await fetch("http://192.168.50.68:3000/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Join Group Failed");
      }

      const { group } = await res.json();
      setGroups([...groups, group]);
      setSelectedGroup(group);
      setInviteCode("");
      setJoinModalVisible(false);
      Alert.alert("Success", "Successfully joined group");
    } catch (e) {
      console.error("Join Group Failed", e);
      Alert.alert("Error", e.message || "Can't join group, please try again");
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.groupItem,
        selectedGroup?._id === item._id && styles.selectedGroup,
      ]}
      onPress={() => handleGroupSelect(item)}
    >
      {item.icon ? (
        <Image source={{ uri: item.icon }} style={styles.groupIcon} />
      ) : (
        <View style={styles.groupIcon}>
          <Text style={styles.groupIconText}>{item.name.charAt(0)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/*Left panel */}
      <View style={styles.groupList}>
        <FlatList
          style={styles.groupList}
          data={groups}
          contentContainerStyle={styles.flatListContent}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubText}>
                {t("create_group_prompt")}
              </Text>
            </View>
          }
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Icon name="plus" size={wp("6%")} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGroup}>
          <Icon name="link" size={wp("6%")} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="sign-out" size={wp("6%")} color="#fff" />
        </TouchableOpacity>
      </View>

      {/*Right panel */}
      <View style={styles.memberList}>
        <View style={styles.header}>
          {/*<TouchableOpacity style={styles.backButton} onPress={logout}>
            <Icon name="arrow-left" size={wp("5%")} color="#fff" />
          </TouchableOpacity>} */}
          <Text style={styles.headerText}>
            {selectedGroup ? selectedGroup.name : t("select_group")}
          </Text>
        </View>
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
        <Text style={styles.headerText}>
          {selectedGroup ? `Invite people by ${selectedGroup.inviteCode}` : ""}
        </Text>
        {selectedGroup && (
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() =>
              navigation.navigate("ShareTaskBoard", {
                groupId: selectedGroup._id,
                groupName: selectedGroup.name,
              })
            }
          >
            <Text style={styles.enterButtonText}>{t("enter_task_board")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal for group creation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setNewGroupName("");
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("create_new_group")}</Text>
            <TextInput
              style={styles.modalInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder={t("input_group_name")}
              placeholderTextColor="#72767d"
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewGroupName("");
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGroupSubmit}
              >
                <Text style={styles.modalButtonText}>{t("create")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => {
          setInviteCode("");
          setJoinModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("join_group")}</Text>
            <TextInput
              style={styles.modalInput}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder={t("enter_invite_code")}
              placeholderTextColor="#72767d"
              maxLength={10}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setInviteCode("");
                  setJoinModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleJoinGroupSubmit}
              >
                <Text style={styles.modalButtonText}>{t("join")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2f3136",
  },
  emptySubText: {
    color: "white",
    borderColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    textAlign: "center",
  },
  groupList: {
    width: wp("20%"),
    paddingVertical: hp("2%"),
    width: wp("20%"),
    flexDirection: "column",
    marginBottom: hp("2%"),
    marginTop: hp("2%"),
  },
  flatListContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: hp("2%"),
    justifyContent: "flex-start",
  },
  groupItem: {
    marginBottom: hp("2%"),
  },
  selectedGroup: {
    borderLeftWidth: 6,
    borderLeftColor: "#7289da",
  },
  groupIcon: {
    width: wp("12%"),
    height: hp("5%"),
    borderRadius: wp("10%"),
    backgroundColor: "#5865f2",
    justifyContent: "center",
    alignItems: "center",
  },
  groupIconText: {
    color: "#fff",
    fontSize: wp("6%"),
    fontWeight: "bold",
  },
  memberList: {
    flex: 1,
    backgroundColor: "#36393f",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    marginVertical: hp("5%"),
    borderRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  backButton: {
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
    marginRight: wp("2%"),
  },
  headerText: {
    color: "#fff",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  memberItem: {
    padding: wp("3%"),
    borderBottomWidth: 1,
    borderBottomColor: "#4f545c",
  },
  memberName: {
    color: "#dcddde",
    fontSize: wp("4%"),
  },
  enterButton: {
    backgroundColor: "#5865f2",
    padding: wp("3%"),
    borderRadius: 5,
    alignItems: "center",
    marginVertical: hp("2%"),
  },
  enterButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },

  //modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#36393f",
    width: wp("80%"),
    padding: wp("5%"),
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  modalInput: {
    backgroundColor: "#2f3136",
    color: "#fff",
    width: "100%",
    padding: wp("3%"),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4f545c",
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: wp("3%"),
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: wp("1%"),
  },
  cancelButton: {
    backgroundColor: "#4F545C",
    padding: wp("2%"),
    borderRadius: 5,
    alignItems: "center",
    marginVertical: hp("3%"),
    marginHorizontal: wp("1%"),
  },
  createButton: {
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
    alignItems: "center",
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
    marginHorizontal: wp("1%"),
  },
  joinButton: {
    backgroundColor: "#43b581",
    padding: wp("2%"),
    borderRadius: 5,
    alignItems: "center",
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
    marginHorizontal: wp("1%"),
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    padding: wp("2%"),
    borderRadius: 5,
    alignItems: "center",
    marginTop: hp("1%"),
    marginBottom: hp("3%"),
    marginHorizontal: wp("1%"),
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
  },
});
