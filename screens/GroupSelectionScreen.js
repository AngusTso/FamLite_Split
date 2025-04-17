import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import TaskBlock from "../components/TaskBlock";
import { SocketContext } from "../contexts/SocketContext";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TextInput } from "react-native-gesture-handler";

const userId = "67ebfd10e60b708a02ff57a3";

export default function GroupSelectionScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `http://192.168.50.68:3000/users/${userId}/groups`
        );
        const groupData = await res.json();
        console.log(groupData);
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
            `http://192.168.50.68:3000/groups/${selectedGroup._id}/members`
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

  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter group name");
      return;
    }

    try {
      const res = await fetch("http://192.168.50.68:3000/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          leaderId: userId,
        }),
      });

      if (!res.ok) {
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
          renderItem={renderGroupItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Icon name="plus" size={wp("6%")} color="#fff" />
        </TouchableOpacity>
      </View>

      {/*Right panel */}
      <View style={styles.memberList}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={wp("5%")} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {selectedGroup ? selectedGroup.name : "Select Group"}
          </Text>
        </View>
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
        {selectedGroup && (
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() =>
              navigation.navigate("ShareTaskBoard", {
                groupId: selectedGroup._id,
              })
            }
          >
            <Text style={styles.enterButtonText}>Enter Task Board</Text>
          </TouchableOpacity>
        )}
      </View>
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
            <Text style={styles.modalTitle}>Create new Group</Text>
            <TextInput
              style={styles.modalInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Input Group Name"
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
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGroupSubmit}
              >
                <Text style={styles.modalButtonText}>Create</Text>
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
  groupList: {
    width: wp("20%"),
    backgroundColor: "#202225",
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  groupItem: {
    marginBottom: hp("2%"),
  },
  selectedGroup: {
    borderLeftWidth: 4,
    borderLeftColor: "#5865f2",
  },
  groupIcon: {
    width: wp("15%"),
    height: hp("15%"),
    borderRadius: wp("7.5%"),
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
  },
  createButton: {
    backgroundColor: "#5865f2",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
});
