import React from "react";
import { Plus, X, User } from "lucide-react";

interface Participant {
  name: string;
  relationship: string;
  age: string;
}

interface ParticipantsStepProps {
  participants: Participant[];
  updateParticipant: (index: number, field: string, value: string) => void;
  addParticipant: () => void;
  removeParticipant: (index: number) => void;
}

export const ParticipantsStep: React.FC<ParticipantsStepProps> = ({
  participants,
  updateParticipant,
  addParticipant,
  removeParticipant,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Thông tin người tham gia xét nghiệm
        </h2>
        <button
          onClick={addParticipant}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm người
        </button>
      </div>

      <div className="space-y-4">
        {participants.map((participant, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Người tham gia {index + 1}
              </h3>
              {participants.length > 2 && (
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Xóa
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.name}
                  onChange={(e) =>
                    updateParticipant(index, "name", e.target.value)
                  }
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mối quan hệ *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.relationship}
                  onChange={(e) =>
                    updateParticipant(index, "relationship", e.target.value)
                  }
                >
                  <option value="">Chọn mối quan hệ</option>
                  <option value="Cha">Cha</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Con">Con</option>
                  <option value="Anh/Chị">Anh/Chị</option>
                  <option value="Em">Em</option>
                  <option value="Ông">Ông</option>
                  <option value="Bà">Bà</option>
                  <option value="Cháu">Cháu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuổi *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.age}
                  onChange={(e) =>
                    updateParticipant(index, "age", e.target.value)
                  }
                  placeholder="25"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Cần ít nhất 2 người tham gia xét nghiệm để có
          thể xác định mối quan hệ huyết thống.
        </p>
      </div>
    </div>
  );
};
