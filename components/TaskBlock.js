import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";

export default function TaskBlock({ task, members, onUpdate }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.taskName);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate) : null
  );
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { token } = useAuth();
  const { t } = useTranslation();

  const handleTaskUpdate = async () => {
    try {
      const res = await fetch(`http://192.168.50.68:3000/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskName,
          description,
          dueDate: dueDate ? dueDate.toISOString() : null,
          assignedTo: assignedTo || null,
          isCompleted: task.isCompleted,
        }),
      });

      const updatedTask = await res.json();
      onUpdate(updatedTask);
      setModalVisible(false);
      setIsEditing(false);
      alert(t("updated_task"));
    } catch (e) {
      console.error("Task updated Failed : ", e);
    }
  };

  const toggleComplete = async () => {
    try {
      const res = await fetch(`http://192.168.50.68:3000/tasks/${task._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });

      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      onUpdate(updatedTask);
    } catch (e) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.taskRow}>
        <TouchableOpacity onPress={toggleComplete} style={styles.checkbox}>
          <Icon
            name={task.isCompleted ? "check-sqaure" : "square"}
            size={wp("5%")}
            color="#5865f2"
          />
        </TouchableOpacity>
        <Text style={[styles.taskName, task.isCompleted && styles.completed]}>
          {task.taskName}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => {
              setIsEditing(false);
              setModalVisible(true);
            }}
          >
            <Icon name="arrow-down" size={wp("5%")} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setIsEditing(true);
              setModalVisible(true);
            }}
          >
            <Icon name="edit" size={wp("5%")} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? t("edit_task") : t("task_info")}
            </Text>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={taskName}
                  onChangeText={setTaskName}
                  placeholder={t("task_name")}
                />
                <TextInput
                  style={styles.modalInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("description")}
                />
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {dueDate
                      ? dueDate.toLocaleDateString()
                      : t("select_deadline")}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDueDate(selectedDate);
                    }}
                  />
                )}
                <RNPickerSelect
                  onValueChange={(value) => setAssignedTo(value)}
                  items={members.map((member) => ({
                    label: member.name, // Display name
                    value: member._id, // Unique identifier for the value
                  }))}
                  style={pickerSelectStyles}
                  value={assignedTo}
                  placeholder={{ label: t("select_a_member"), value: null }}
                />
              </>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("task_name")}: </Text>
                  <Text style={styles.detailText}>{task.taskName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("description")}: </Text>
                  <Text style={styles.detailText}>
                    {task.description || "No Description"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("deadline")}: </Text>
                  <Text style={styles.detailText}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : t("no_deadline")}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("assigned_to")}: </Text>
                  <Text style={styles.detailText}>
                    {members.find((m) => m._id === task.assignedTo)?.name ||
                      "Not assigned"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("created_by")}: </Text>
                  <Text style={styles.detailText}>
                    {members.find((m) => m._id === task.createdBy)?.name ||
                      t("not_applicable")}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("created_at")}: </Text>
                  <Text style={styles.detailText}>
                    {new Date(task.createdAt).toLocaleString()}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              {isEditing && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleTaskUpdate}
                >
                  <Text style={styles.modalButtonText}>{t("save")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: wp("4%"),
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkbox: {
    marginRight: wp("2%"),
  },
  taskName: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  completed: {
    textDecorationLine: "line-through",
    color: "#72767d",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButton: {
    backgroundColor: "#000",
    padding: wp("2%"),
    borderRadius: 5,
    marginRight: wp("2%"),
  },
  editButton: {
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: wp("80%"),
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: wp("5%"),
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: hp("1%"),
  },
  detailLabel: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "#000",
    width: wp("25%"),
  },
  detailText: {
    fontSize: wp("4%"),
    color: "#333",
    flex: 1,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 5,
    width: "100%",
    padding: wp("2%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 5,
    padding: wp("2%"),
    marginBottom: hp("2%"),
    width: "100%",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: wp("4%"),
    color: "#000",
  },
  picker: {
    width: "100%",
    height: hp("5%"),
    marginBottom: hp("2%"),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
    width: wp("30%"),
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
  },
});

//RNPickerSelect styles
const pickerSelectStyles = {
  inputIOS: {
    fontSize: wp("4%"),
    padding: wp("2%"),
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    color: "#333",
    marginBottom: hp("2%"),
  },
  inputAndroid: {
    fontSize: wp("4%"),
    padding: wp("2%"),
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    color: "#333",
    marginBottom: hp("2%"),
  },
  placeholder: {
    color: "#72767d",
  },
};
