import React from "react";
import { Plus, X, User, Star } from "lucide-react";

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
        {participants.map((participant, index) => {
          const isMainPerson = index === 0;

          return (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${
                isMainPerson
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-medium flex items-center gap-2 ${
                    isMainPerson ? "text-red-900" : "text-gray-900"
                  }`}
                >
                  {isMainPerson ? (
                    <>
                      <Star className="w-4 h-4 text-red-600" />
                      Người xét nghiệm chính
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Người tham gia {index + 1}
                    </>
                  )}
                </h3>

                {/* ✅ Chỉ cho phép xóa từ người thứ 3 trở đi */}
                {participants.length > 2 && index > 1 && (
                  <button
                    onClick={() => removeParticipant(index)}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Xóa
                  </button>
                )}
              </div>

              {/* ✅ Thêm mô tả cho người xét nghiệm chính */}
              {isMainPerson && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Người xét nghiệm chính:</strong> Là người làm trung
                    tâm để xác định mối quan hệ huyết thống với những người khác
                    trong test.
                  </p>
                </div>
              )}

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
                    placeholder={
                      isMainPerson
                        ? "Tên người xét nghiệm chính"
                        : "Nhập họ tên"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMainPerson
                      ? "Vai trò *"
                      : "Mối quan hệ với người chính *"}
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={participant.relationship}
                    onChange={(e) =>
                      updateParticipant(index, "relationship", e.target.value)
                    }
                  >
                    {isMainPerson ? (
                      <>
                        <option value="">Chọn vai trò</option>
                        <option value="Người xét nghiệm chính">
                          Người xét nghiệm chính
                        </option>
                        <option value="Cha">Cha (làm người chính)</option>
                        <option value="Mẹ">Mẹ (làm người chính)</option>
                        <option value="Con">Con (làm người chính)</option>
                      </>
                    ) : (
                      <>
                        <option value="">Chọn mối quan hệ</option>
                        <option value="Cha">Cha của người chính</option>
                        <option value="Mẹ">Mẹ của người chính</option>
                        <option value="Con">Con của người chính</option>
                        <option value="Anh/Chị">Anh/Chị của người chính</option>
                        <option value="Em">Em của người chính</option>
                        <option value="Ông">Ông của người chính</option>
                        <option value="Bà">Bà của người chính</option>
                        <option value="Cháu">Cháu của người chính</option>
                      </>
                    )}
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
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong>
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>
            • <strong>Người xét nghiệm chính</strong> là trung tâm để xác định
            mối quan hệ với những người khác
          </li>
          <li>
            • Cần ít nhất 2 người tham gia xét nghiệm để có thể xác định mối
            quan hệ huyết thống
          </li>
          <li>
            • Tất cả mối quan hệ sẽ được tính dựa trên người xét nghiệm chính
          </li>
        </ul>
      </div>
    </div>
  );
};
